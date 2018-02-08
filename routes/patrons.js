var express = require('express');
var router = express.Router();

const { Patron, Loan, Book }  = require('../models');

let validationError = {
    first_name: 0,
    last_name: 0,
    address: 0,
    email: 0,
    library_id: 0,
    zip_code: 0
}


/* GET patrons listing. */
router.get('/', function(req, res, next) {
    Patron.findAll({order: [["id", "DESC"]]})
        .then(function(patrons){
            res.render("patrons", {patrons: patrons});
        })
        .catch(function(error){
            res.send(500, error);
    });
});

/* New Patron form */
router.get('/new_patron',(request, response) => {
    response.render('new_patron', {validation: validationError});
});

// Create a new Patron
router.post('/', (request, response) => {
    validationError = {
        first_name: 0,
        last_name: 0,
        address: 0,
        email: 0,
        library_id: 0,
        zip_code: 0
    }
    if(request.body.first_name === "") {
        validationError.first_name = 1;
    }
    if(request.body.last_name === "") {
        validationError.last_name = 1;
    }
    if(request.body.address === "") {
        validationError.address = 1;
    }
    if(request.body.email === "") {
        validationError.email = 1;
    }
    if(request.body.library_id === "") {
        validationError.library_id = 1;
    }
    if(request.body.zip_code === "") {
        validationError.zip_code = 1;
    }
    Patron.create({
        first_name: request.body.first_name,
        last_name: request.body.last_name,
        address: request.body.address,
        email: request.body.email,
        library_id: request.body.library_id,
        zip_code: request.body.zip_code
    })
    .then(function() {
        response.redirect('/patrons');
    }).catch( () => {
        response.redirect("/patrons/new_patron");
    })
});

// GET patron details
router.get("/details/:id", (request, response) => {
    let id = request.params.id;
    let loan = Loan.findAll({
        include: [
            {model: Book}, {model: Patron}
        ],
        where: {patron_id: id}
    });
    let patron = Patron.findAll({
        where: {id: id}
    });
    Promise.all([patron, loan])
    .then(result => {
        response.render("patron_detail", {patrons: result[0], loans:result[1], validation: validationError})
    })
    .catch(function(error){
        response.send(500, error);
     });
});

//Update Patron details
router.post('/details/:id', (request, response) => {
    validationError = {
        first_name: 0,
        last_name: 0,
        address: 0,
        email: 0,
        library_id: 0,
        zip_code: 0
    }
    if(request.body.first_name === "") {
        validationError.first_name = 1;
    }
    if(request.body.last_name === "") {
        validationError.last_name = 1;
    }
    if(request.body.address === "") {
        validationError.address = 1;
    }
    if(request.body.email === "") {
        validationError.email = 1;
    }
    if(request.body.library_id === "") {
        validationError.library_id = 1;
    }
    if(request.body.zip_code === "") {
        validationError.zip_code = 1;
    }
    let patron_id = request.params.id;
    Patron.update( request.body ,{
        where: {id: patron_id}
    })
    .then( () => {
        response.redirect("/patrons");
    })
    .catch( () => {
        response.redirect("/patrons/details/"+ patron_id);
     });
});

//POST searched result
router.post("/search", (req, res) => {
    let searchValue = req.body.search;
    Patron.findAll()
    .then(result => {
        res.render("patrons", {patrons: result});
    })
});


module.exports = router;