const { json } = require("body-parser");
const { remove } = require("../models/productModel");

class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                // operator of mongodb regular exp.
                $regex: this.queryStr.keyword,
                $options: "i",
            },
        } : {};

        console.log(keyword);
        // sending keyword by making name
        this.query = this.query.find({ ...keyword });
        // return the class
        return this;

    }

    //filter
    filter() {
        const queryCopy = { ...this.queryStr };
        console.log(queryCopy);
        //removing some field from category
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach((key) => delete queryCopy[key]);

        //filetr for price and rating
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        this.query = this.query.find(JSON.parse(queryStr));
        console.log(queryStr);
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }


};

module.exports = ApiFeatures;