#! /usr/bin/env node

var fs = require('fs'),
    cheerio = require('cheerio'),
    http = require('http'),
    photo = require('./photo');

var commit = process.argv;

if(commit[2] == 'renren'){
    if(commit[3]){
        console.log(commit);
        photo.getAlbum(commit[3]);
        // albumList.foreach(function(page){
        //     photo.getPage(page);
        // })
        //options.path = commit[3].replace('http://page.renren.com','') + '?curpage=0';
    }    
}