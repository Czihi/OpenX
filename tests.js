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

function testPostCounting(users, posts){
    for (const post in posts){
        posts[post]['userId']="invalidID";
    }
    let counted = countPosts(users, posts);
    console.log("TEST: ID żadnego z użytkowników nie zgadza sie z ID autora posta")
    console.log(counted)
    for (const post in posts){
        posts[post]['userId']=users[0]['id'];
    }
    counted = countPosts(users, posts);
    console.log("TEST: Wszystkie posty napisał ten sam użytkownik")
    console.log(counted)

}
function testFindingDuplicates(posts){
    for(const post in posts){
        posts[post]['title']="Powtórzony tytuł"
    }
    let duplicates = findDuplicateTitles(posts);
    console.log("TEST: Wszystkie posty mają ten sam tytuł")
    console.log(duplicates)

    for(const post in posts){
        posts[post]['title']=post
    }
    duplicates = findDuplicateTitles(posts);
    console.log("TEST: Każdy post ma inny tytuł")
    console.log(duplicates)
    
}
function testFindingClosestUsers(users){
    geo=0
    for(const user in users){
        if(user%2==0){
            geo+=10/users.length
        }
        users[user]['address']['geo']['lat']=geo
        users[user]['address']['geo']['lng']=geo   
    }
    let closestUsers=findClosestUsers(users);
    console.log("TEST: Dla każdego użytkownika istnieje osoba mieszkajaca w tym samym miejscu (oczekujemy par)")
    console.log(closestUsers)
    for(const user in users){
        users[user]['address']['geo']['lat']=0
        users[user]['address']['geo']['lng']=0   
    }
    closestUsers=findClosestUsers(users);
    console.log("TEST: Wszyscy użytkownicy mieszkają w tym samym miejscu")
    console.log(closestUsers)
}

async function test(){
    const users = await getUsers();
    const posts = await getPosts();
    testPostCounting(users, posts)
    testFindingDuplicates(posts);
    testFindingClosestUsers(users)
  
}
test();