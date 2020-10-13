const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const zseitszyfrowanie = require('bcryptjs');
const dbConnection = require('./database');
const { body, validationResult } = require('express-validator');
const colors = require('colors');
const app = express();
app.use(express.urlencoded({extended:false}));

// Silnik
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');

// Pliki cookie
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge:  3600 * 1000 // 1hr
}));

// Jeżeli nie zalogowany to wyświetl stronę
const ifNotLoggedin = (req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.render('login-register');
    }
    next();
}

const ifLoggedin = (req,res,next) => {
    if(req.session.isLoggedIn){
        return res.redirect('/home');
    }
    next();
}
// Koniec middleware'a

// Stona główna
app.get('/', ifNotLoggedin, (req,res,next) => {
    dbConnection.execute("SELECT `name` FROM `users` WHERE `id`=?",[req.session.userID])
    .then(([rows]) => {
        res.render('home',{
            name:rows[0].name
        });
    });
    
});
// Koniec


// Moduł rejestracji
app.post('/register', ifLoggedin, 
// wyślij dane
[
    body('user_email','Invalid email address!').isEmail().custom((value) => {
        return dbConnection.execute('SELECT `email` FROM `users` WHERE `email`=?', [value])
        .then(([rows]) => {
            if(rows.length > 0){
                return Promise.reject('Ten adres email jest już w użyciu!');
            }
            return true;
        });
    }),
    body('user_name','Login nie może być pusty!').trim().not().isEmpty(),
    body('user_pass','Hasło musi mieć conajmniej 6 znaków').trim().isLength({ min: 6 }),
],// koniec wysyłania
(req,res,next) => {

    const validation_result = validationResult(req);
    const {user_name, user_pass, user_email} = req.body;
    // Jeżeli brak erroru
    if(validation_result.isEmpty()){
        // Szyfrowanie haseł
        zseitszyfrowanie.hash(user_pass, 12).then((hash_pass) => {
            // Dodawanie do bazy
            dbConnection.execute("INSERT INTO `users`(`name`,`email`,`password`) VALUES(?,?,?)",[user_name,user_email, hash_pass])
            .then(result => {
                res.send(`pomyślnie stworzono konto`);
                console.log("Stworzono konto")
                console.log(result)
            }).catch(err => {
                // Jeżeli error => wywal error
                if (err) throw err;
            });
        })
        .catch(err => {
            // jeżeli błąd szyfrowania => wywal error
            if (err) throw err;
        })
    }
    else{
        // 
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        res.render('login-register',{
            register_error:allErrors,
            old_data:req.body
        });
    }
});// Koniec modułu rejestracji

// Moduł logowania
app.post('/', ifLoggedin, [
    body('user_email').custom((value) => {
        return dbConnection.execute('SELECT `email` FROM `users` WHERE `email`=?', [value])
        .then(([rows]) => {
            if(rows.length == 1){
                return true;
                
            }
            return Promise.reject('Zły adres email!');
            
        });
    }),
    body('user_pass','Hasło nie może być puste!').trim().not().isEmpty(),
], (req, res) => {
    const validation_result = validationResult(req);
    const {user_pass, user_email} = req.body;
    if(validation_result.isEmpty()){
        
        dbConnection.execute("SELECT * FROM `users` WHERE `email`=?",[user_email])
        .then(([rows]) => {
            console.log(rows[0].password);
            zseitszyfrowanie.compare(user_pass, rows[0].password).then(compare_result => {
                if(compare_result === true){
                    req.session.isLoggedIn = true;
                    req.session.userID = rows[0].id;

                    res.redirect('/');
                }
                else{
                    res.render('login-register',{
                        login_errors:['Złe hasło!']
                    });
                }
            })
            .catch(err => {
                if (err) throw err;
            });


        }).catch(err => {
            if (err) throw err;
        });
    }
    else{
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        res.render('login-register',{
            login_errors:allErrors
        });
    }
});
// Koniec modułu logowania

// Moduł wylogowywania
app.get('/logout',(req,res)=>{
    // Ususwanie sesji użytkownika
    req.session = null;
    res.redirect('/');
});
// Koniec modułu

app.use('/', (req,res) => {
    res.status(404).send('<h1>Błąd 404</h1>');
});

app.listen(3001, () => console.log("Serwer został uruchomiony...".blue));
