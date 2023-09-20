export function addUserToLocalStorage(user) {
    let usersString = localStorage.getItem("users");
    let users = [];
    if(usersString) {
        users = JSON.parse(usersString);
    }
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
}