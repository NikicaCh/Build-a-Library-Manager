var express = require('express');
var router = express.Router();

const {Book, Loan, Patron} = require('../models');
let limit = 6,
    offset = 0;
    
let validationError = {
    title: 0,
    author: 0,
    genre: 0
}


/* GET books listing. */
router.get('/', function(req, res) {
    let page = req.query.page;
    Book.findAndCountAll()
    .then(result => {
        let pages = Math.ceil(result.count / limit);
		offset = limit * (page - 1);
    
    Book.findAll({
        order: [['title', 'DESC'],],
        limit: limit,
        offset: offset 
    })

    .then(result => {
        res.render('books', {books : result, pages: pages, page: page});  
    })
})
    .catch(function(error){
        res.send(500, error);
});
});

/* GET checkedout books listing */
router.get("/checkedout",(request, response) => {
    let page = request.query.page;
    Book.findAndCountAll({
        include: [{
            model: Loan,
            where: {returned_on: null}
        }],
    })
    .then(result => {
        let pages = Math.ceil(result.count / limit);
		offset = limit * (page - 1);
    Book.findAll({ 
        limit: limit,
        offset: offset, 
        include: [{
        model: Loan,
        where: {returned_on: null}
        }],
    })
    .then(result => {
        response.render('checked_out_books', {checkedout: result, pages: pages, page: page});
    })
})
});

/* GET overdue books listing */
router.get("/overdue",(request, response) => {
    let page = request.query.page;
    Book.findAndCountAll({
        include: [{
            model: Loan,
            where: {return_by: { lt: new Date() }, returned_on: null}
        }],
    })
    .then(result => {
        let pages = Math.ceil(result.count / limit);
		offset = limit * (page - 1);
    
    Book.findAll({
        include: [{
        model: Loan,
        where: {return_by: { lt: new Date() }, returned_on: null}
        }],
    })
    .then(result => {
        response.render('overdue_books', {overdue_books: result, pages: pages, page: page})
    })
})
});

/* New Book form */
router.get('/new_book',(request, response) => {
    response.render('new_book', {title: 'Create new Book'});
});

/* Create a new Book record */
router.post('/', (request, response) => {
        let errorMessage = 0;
        if(request.body.title == "" || request.body.author == "" || request.body.genre == ""  ) {
            errorMessage = 1;
        }
    Book.create({
        title: request.body.title,
        author: request.body.author,
        genre: request.body.genre,
        first_published: request.body.first_published
    })
    .then(function() {
        response.redirect('/books');
    }).catch(function(error){
        if(error.name === "SequelizeValidationError") {
          response.render('new_book', {error: error, errorMessage: errorMessage})
        } else {
          throw error;
        }
    }).catch(function(error){
        response.send(500, error);
     });
});

/* Book details */
router.get('/details/:id', (request, response) => {
    let id = request.params.id;

    let book =Book.findAll({
        where:{ id : id}
    });
    let loan = Loan.findAll({
        where: {book_id: id},
        include: [{model: Patron}, {model: Book}]
    });

    Promise.all([book, loan])
    .then(result => {
        response.render('book_detail', {books : result[0], loans: result[1], validation: validationError });
    });
});

/* Update book details */
router.post('/details/:id', (request, response) => {
    validationError = {
        title: 0,
        author: 0,
        genre: 0
    }
    if(request.body.title === "") {
        validationError.title = 1;
    }
    if(request.body.author === "") {
        validationError.author = 1;
    }
    if(request.body.genre === "") {
        validationError.genre = 1;
    }
    let id = request.params.id;
    Book.update( request.body, {
        where: {id: request.params.id}
    })
    .then(function(book){
        return response.redirect("/books/");
    }).catch( (error) => {
        response.redirect("/books/details/" + id);
    });
});

  
module.exports = router;