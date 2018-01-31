var express = require('express');
var router = express.Router();

const { Patron, Loan, Book }  = require('../models');

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
    response.render('new_patron');
});

// Create a new Patron
router.post('/', (request, response) => {
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
    }).catch(function(error){
        if(error.name === "SequelizeValidationError") {
          response.render('new_patron', {error: error})
        } else {
          throw error;
        }
    })
    .catch(function(error){
        response.send(500, error);
     });
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
        response.render("patron_detail", {patrons: result[0], loans:result[1]})
    })
    .catch(function(error){
        response.send(500, error);
     });
});

//Update Patron details
router.post('/details/:id', (request, response) => {
    let patron_id = request.params.id;
    Patron.update( request.body ,{
        where: {id: patron_id}
    })
    .then( () => {
        response.redirect("/patrons");
    })
    .catch(function(error){
        response.send(500, error);
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