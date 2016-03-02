"use strict";
const db = require('../db-plugin')('db');
const Logger = require('../logger')('blog-plugin');

module.exports = function () {
    const log = Logger.getLogger('blog-service');
    const posts = db.sublevel('posts');

    class BlogService {
        constructor() {
            console.log('This is the constructor.');
        }

        post(post, callback) {
            log('post', post);
            post.id = `post-${Date.now()}`;
            posts.put(post.id, post, callback);
        }

        put(post, callback) {
            log('put', post);
            posts.put(post.id, post, callback);
        }

        get(id, callback) {
            log('get', id);
            posts.get(id, callback);
        }

        remove(id, callback) {
            log('remove', id);
            posts.del(id, callback);
        }
    }

    return new BlogService();
};
