var express = require('express');
var router = express.Router();

const {Loan, Book, Patron} = require('../models');


let date = new Date()
    limit = 6,
    offset = 0;

formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
let now = formatDate(date);

/* GET loans listing. */
router.get('/', function(req, res, next) {
    let page = req.query.page;
    Loan.findAndCountAll()
    .then(result => {
        let pages = Math.ceil(result.count / limit);
		offset = limit * (page - 1);
    let options = {limit: limit, offset: offset ,include: [{ model: Book }, { model: Patron }] };
    Loan.findAll(options)
        .then(function(result){
            res.render('loans', {loans: result, pages: pages, page: page});
        })
    })
        .catch(function(error){
            res.send(500, error);
    });
});

/* GET checkedout loans listing */
router.get("/checkedout/",(request, response) => {
    let page = request.query.page;
    Loan.findAndCountAll({
        where: {returned_on: null},
        include: [
        {model: Book}, {model: Patron}
        ],
    })
    .then(result => {
        let pages = Math.ceil(result.count / limit);
		offset = limit * (page - 1);
    Loan.findAll({
        limit: limit,
        offset: offset,
        where: {returned_on: null},
        include: [
        {model: Book}, {model: Patron}
        ],
    })

    .then(result => {
        response.render('checked_out_loans', {checkedout: result, pages: pages, page: page});
    })
})
});

/* GET overdue loans listing */
router.get("/overdue",(request, response) => {
    let page = request.query.page;
    Loan.findAndCountAll({
        where: {return_by: { lt: new Date() }, returned_on: null},
        include: [
            {model: Book}, {model: Patron}
        ],
    })
    .then(result => {
        let pages = Math.ceil(result.count / limit);
		offset = limit * (page - 1);
    Loan.findAll({
        where: {return_by: { lt: new Date() }, returned_on: null},
        include: [
            {model: Book}, {model: Patron}
        ],
    })
    .then(result => {
        response.render('overdue_loans', {overdue_loans: result, pages: pages, page: page})
    })
})
});

/* New Loan form */
router.get('/new_loan',(request, response) => {
    let patrons = Patron.findAll();
    let books = Book.findAll();
    Promise.all([books, patrons])
    .then(result => {
        response.render('new_loan', {books: result[0],patrons: result[1],title: 'Create new Loan', now: now});
    });
});

/*Return a book form */
router.get('/return_book/:id', (request, response) => {
    let book_id = request.params.id;
    let loan = Loan.findAll({
        include: [
            {model: Book}, {model: Patron}
        ],
        where: {book_id: book_id}
    })
    .then(result => {
        response.render("return_book", {loans: result, now: now});
    }) 
});

/*Return a Book */
router.post('/return_book/:id', (request, response) => {
    let book_id = request.params.id;
    Loan.update( request.body ,{
        where: {book_id: book_id}
    })
    .then( () => {
        response.redirect("/loans");
    })
});

/* Create a new Loan */
router.post('/', (request, response) => {
    Loan.create({
        book_id: request.body.book_id,
        patron_id: request.body.patron_id,
        loaned_on: request.body.loaned_on,
        return_by: request.body.return_by,
        returned_on: null
    })
    .then(function() {
        response.redirect('/loans');
    }).catch(function(error){
        if(error.name === "SequelizeValidationError") {
          response.render('new_loan', {error: error})
        } else {
          throw error;
        }
    }).catch(function(error){
        response.send(500, error);
     });
});


module.exports = router;