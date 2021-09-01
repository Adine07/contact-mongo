const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const {body, validationResult, check} = require('express-validator')
const methodOverride = require('method-override')

const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')

// Db
require('./utils/db')
const Contact = require('./model/contact')

const app = express()
const port = 3000

// Setup Method Override
app.use(methodOverride('_method'))

// setup pakai ejs
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

// Konfigurasi Flash Message
app.use(cookieParser('secret'))
app.use(
  session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
)
app.use(flash())

// Halaman Home
app.get('/', (req, res) => {
  const mahasiswa = [
    {
      nama: "pahmi",
      email: "pahmi@mail.com"
    },
    {
      nama: "joned",
      email: "joned@mail.com"
    },
    {
      nama: "supri",
      email: "supri@mail.com"
    },
  ]
  res.render('index', {
    title: 'Home',
    nama: "A Pamungkas",
    mahasiswa,
    layout: 'layouts/app',
  })
})

// Halaman About
app.get('/about', (req, res) => {
  res.render('about', {
    layout: 'layouts/app',
    title: "About"
  })
})

// Halaman Contact
app.get('/contact', async (req, res) => {
  // Contact.find().then(contact => {
  //   res.send(contact)
  // })
  const contacts = await Contact.find();
  // console.log(contacts)
  res.render('contact', {
    layout: 'layouts/app',
    title: "Contact",
    contacts,
    msg: req.flash('msg')
  })
})

// Halaman Buat contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Form Tambah Data Contact',
    layout: 'layouts/app',
  })
})

// Store Contact
app.post('/contact', [
  body('nama').custom( async (value) => {
    const duplicat = await Contact.findOne({nama: value})
    if (duplicat) {
      throw new Error('Nama contact sudah terdaftar!')
    }
    return true
  }),
  check('email', 'Email tidak valid').isEmail(),
  check('nohp', 'Nomor Hp tidak valid').isMobilePhone('id-ID')
], (req, res) => {
  const err = validationResult(req)
  if (!err.isEmpty()) {
    // return res.status(400).json({error: err.array()})
    res.render('add-contact', {
      title: 'Form Tambah Data Contact',
      layout: 'layouts/app',
      errors: err.array()
    })
  }else{
    Contact.insertMany(req.body, (error, result) => {
      // Kirim Flash Message
      req.flash('msg', 'Data Contact berasil ditambahkan!')
      res.redirect('/contact')
    })
  }
})

// delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//   const contact = await Contact.findOne({nama: req.params.nama})

//   // jika contact tidak ada
//   if (!contact) {
//     res.status(404)
//     res.send("<h1>404</h1>")
//   }else{
//     // res.send('ok')
//     Contact.deleteOne({_id: contact._id}).then(() => {
//       req.flash('msg', 'Data Contact berasil dihapus!')
//       res.redirect('/contact')
//     })
//   }
// })
app.delete('/contact', (req, res) => {
  Contact.deleteOne({_id: req.body._id}).then(() => {
    req.flash('msg', 'Data Contact berasil dihapus!')
    res.redirect('/contact')
  })
})

// Halaman edit contact
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({nama: req.params.nama})
  res.render('edit-contact', {
    title: 'Form Ubah Data Contact',
    layout: 'layouts/app',
    contact,
  })
})

// Proses Update contact
app.put('/contact', [
  body('nama').custom( async (value, {req}) => {
    const duplicat = await Contact.findOne({nama: value})
    if (value !== req.body.oldNama && duplicat) {
      throw new Error('Nama contact sudah terdaftar!')
    }
    return true
  }),
  check('email', 'Email tidak valid').isEmail(),
  check('nohp', 'Nomor Hp tidak valid').isMobilePhone('id-ID')
], (req, res) => {
  const err = validationResult(req)
  if (!err.isEmpty()) {
    res.render('edit-contact', {
      title: 'Form Ubah Data Contact',
      layout: 'layouts/app',
      errors: err.array(),
      contact: req.body
    })
  }else{
    Contact.updateOne(
      {_id: req.body._id},
      {
        $set: {
          nama: req.body.nama,
          email: req.body.email,
          nohp: req.body.nohp,
        }
      }
      ).then(() => {
        req.flash('msg', 'Data Contact berasil diubah!')
        res.redirect('/contact')
      })
  }
})

// Tampilkan detail contact
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({nama: req.params.nama});
  // console.log(contacts)
  res.render('detail', {
    layout: 'layouts/app',
    title: "Detail Contact",
    contact
  })
})

app.listen(port, () => {
    console.log(`Mongo contact | listening at http://localhost:${port}`)
})