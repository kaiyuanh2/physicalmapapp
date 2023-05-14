const Joi = require('joi');

const schema = Joi.object({
    item: Joi.string().valid('aero', 'body', 'abd', 'trunk', 'ub', 'flex').required().default('aero'),
    grade: Joi.string().valid('5', '7', '9').required().default('5'),
    year: Joi.string().valid('1999', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019').required().default('2019')
});

module.exports.validateParameters = async (req, res, next) => {
    // console.log('validating...');
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.log('param error');
        req.query = schema.validate({}).value;
        req.flash('error', "Invalid parameter(s)! Displaying the map under default options: Aerobic Capacity, 5th Grade, and 2018-2019 School Year");
    } else {
        req.query = value;
    }
    next();
}