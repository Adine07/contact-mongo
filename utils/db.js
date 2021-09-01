const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/mahasiswa',{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});


// // Menambah 1 data
// const contact1 = new Contact({
//     nama: 'Adine Pamungkas',
//     nohp: '085601214330',
//     email: 'mancunian@adi.com',
// })

// // Simpan ke Collection
// contact1.save().then(contact => console.log(contact))