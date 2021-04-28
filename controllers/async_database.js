var mysql = require('mysql');
var express = require('express');


class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( {
            host: 'localhost', // Replace with your host name
            user: 'artx',      // Replace with your database username
            password: 'ArtxIMS2021',  // Replace with your database password
            database: 'artxims' // // Replace with your database Name
        } );
    }
    insert( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, result ) => {
                if ( err )
                    return reject( err );
                resolve( result );
            } );
        } );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    delete( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, result ) => {
                if ( err )
                    return reject( err );
                resolve( result );
            } );
        } );
    }
    update( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, result ) => {
                if ( err )
                    return reject( err );
                resolve( result );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

module.exports = new Database();