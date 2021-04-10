const fetch = require("node-fetch");

async function getUsers() {
    let response = await fetch('https://jsonplaceholder.typicode.com/users');
    let users = await response.json();
    return users;
}

async function getPosts() {
    let response = await fetch('https://jsonplaceholder.typicode.com/posts');
    let posts = await response.json();
    return posts;
}

function countPosts(users, posts) {
    let dictionary = {};
    let messages = [];
    for (const user in users) {
        dictionary[users[user]['id']] = 0;
    }
    for (const post in posts) {
        dictionary[posts[post]['userId']] += 1;
    }
    for (const user in users) {
        const message = `${users[user]['username']} napisał(a) ${dictionary[users[user]['id']]} wiadomości`;
        messages.push(message);
    }
    return messages
}

function findDuplicateTitles(posts) {
    const numberOfPosts = posts.length;
    let duplicateTitles = [];
    for (let i = 0; i < numberOfPosts; i++) {
        let searchedTitle = posts[i]['title'];
        if(duplicateTitles.indexOf(searchedTitle)==-1){
            for (let j = i + 1; j < numberOfPosts; j++) {
                if (searchedTitle == posts[j]['title']) {
                    duplicateTitles.push(searchedTitle);
                    break;
                }
            }
        }
    }
    return duplicateTitles;
}

function calculateDistance(lng1, lng2, lat1, lat2) { //Funkcja na podstawie formuły Haversine
    lng1 = lng1 * Math.PI / 180;
    lng2 = lng2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    let dlng = lng2 - lng1;
    let dlat = lat2 - lat1;
    let earthRadius = 6371;
    let h = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2)* Math.pow(Math.sin(dlng / 2), 2);
    let distance = 2 * earthRadius * Math.asin(Math.sqrt(h))
    return distance;
}

function findClosestUsers(users) {
    const numberOfUsers = users.length;
    let lat1, lng1, lat2, lng2;
    let distance;
    let smallestDistance;
    let closestUsers = {};
    for (const user in users) {
        smallestDistance = Number.MAX_VALUE;
        closestUsers[users[user]['username']] = null;
        lat1 = parseFloat(users[user]['address']['geo']['lat']);
        lng1 = parseFloat(users[user]['address']['geo']['lng']);
        for (const anotherUser in users) {
            if (anotherUser != user) {
                lat2 = parseFloat(users[anotherUser]['address']['geo']['lat']);
                lng2 = parseFloat(users[anotherUser]['address']['geo']['lng']);
                distance = calculateDistance(lat1, lat2, lng1, lng2);
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    closestUsers[users[user]['username']] = users[anotherUser]['username'];
                }

            }
        }
    }
    return closestUsers;
}

async function main() {
    const users = await getUsers();
    const posts = await getPosts();
    const counted = countPosts(users, posts);
    const duplicates = findDuplicateTitles(posts);
    const closestUsers = findClosestUsers(users);
    console.log(`Ile postów napisał dany user:`);
    console.log(counted);
    console.log('Zduplikowane tytuły:');
    console.log(duplicates);
    console.log("Najbliżej mieszkający użytkownicy:");
    console.log(closestUsers);
}


main();
