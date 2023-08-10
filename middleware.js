const Joi = require('joi');

const schema = Joi.object().keys({
    item: Joi.string().valid('aero', 'body', 'abd', 'trunk', 'ub', 'flex').required().default('aero'),
    grade: Joi.string().valid('5', '7', '9').required().default('5'),
    year: Joi.string().valid('1999', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019').required().default('2019'),
    checkboxStr: Joi.string().required().min(3).default('all'),
    checkedLength: Joi.number().integer().required().min(1).max(1125).default(1125)
}).unknown(true);

const schemaCustom = Joi.object().keys({
    item: Joi.string().required().default('insurance'),
    checkboxStr: Joi.string().required().min(3).default('all'),
    checkedLength: Joi.number().integer().required().min(1).max(1125).default(1125)
}).unknown(true);

module.exports.validateParameters = async (req, res, next) => {
    // console.log('validating...');
    // const { error, value } = schema.validate(req.query);
    // if (error) {
    //     console.log('param error');
    //     req.query = schema.validate({}).value;
    //     req.flash('error', "Invalid parameter(s)! Displaying the map under default options: Aerobic Capacity, 5th Grade, and 2018-2019 School Year");
    // } else {
    //     req.query = value;
    // }
    next();
}

module.exports.validateParametersPostCustom = async (req, res, next) => {
    // console.log('validating...');
    const { error, value } = await schemaCustom.validate(req.body);
    if (error) {
        console.log(value);
        req.body.item = 'insurance';
        req.body.checkboxStr = 'all';
        req.body.checkedLength = '1125';
        req.flash('error', "Invalid parameter(s)! Displaying the map under default options: Map of Insurance Coverage, and the whole California. Please make sure that every parameter is not empty and is valid.");
        console.log(req.body);
    } else {
        req.body = value;
    }
    next();
}

module.exports.validateParametersPost = async (req, res, next) => {
    // console.log('validating...');
    const { error, value } = await schema.validate(req.body);
    if (error) {
        console.log(value);
        req.body.item = 'aero';
        req.body.grade = '5';
        req.body.year = '2019';
        req.body.checkboxStr = 'all';
        req.body.checkedLength = '1125';
        req.flash('error', "Invalid parameter(s)! Displaying the map under default options: Aerobic Capacity, 5th Grade, 2018-2019 School Year, and the whole California. Please make sure that every parameter is not empty and is valid.");
        console.log(req.body);
    } else {
        req.body = value;
    }
    next();
}