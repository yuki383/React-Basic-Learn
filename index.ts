// Transformation
function NameBox(name: string) {
  return { fontWeight: "bold", labelContent: name };
}

type User = {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: number;
};

function FancyUserBox(user: User) {
  return {
    borderStyle: "1px solid blue",
    childContent: ["Name: ", NameBox(user.firstName + " " + user.lastName)],
  };
}

function FancyBox(children: any[]) {
  return {
    borderStyle: "1px solid blue",
    children: children,
  };
}

function UserBox(user: User) {
  return FancyBox(["Name: ", NameBox(user.firstName + " " + user.lastName)]);
}

function LikeBox(likes: number) {
  return { borderStyle: "1px solid red", labelContent: likes };
}

function LikeButton(onClick: () => unknown) {
  return { onClick };
}

function FancyNameBox(user: User, likes: number, onClick: () => unknown) {
  return FancyBox([
    "Name: ",
    NameBox(user.firstName + " " + user.lastName),
    "Likes: ",
    LikeBox(likes),
    LikeButton(onClick),
  ]);
}

function rerender() {
  console.log("rerender");
}

var likes = 0;
function addOneMoreLike() {
  likes++;
  rerender();
}

FancyNameBox({ firstName: "yamada", lastName: "tarou" }, likes, addOneMoreLike);

function memoize(fn: (arg: any) => any) {
  var cachedArg: any;
  var cachedResult: any;
  return function (arg: any) {
    if (cachedArg === arg) {
      return cachedResult;
    }
    cachedArg = arg;
    cachedResult = fn(arg);
    return cachedResult;
  };
}

var MemoizedNameBox = memoize(NameBox);

function NameAndAgeBox(user: User, currentTime: number) {
  return FancyBox([
    "Name: ",
    MemoizedNameBox(user.firstName + " " + user.lastName),
    "Age in milliseconds: ",
    currentTime - user.dateOfBirth!,
  ]);
}

function UserList(
  users: User[],
  likesPerUser: Map<number, number>,
  updateUserLikes: (id: number, newLikes: number) => unknown
) {
  return users.map(user => FancyNameBox(
    user,
    likesPerUser.get(user.id!)!,
    () => updateUserLikes(user.dateOfBirth!, likesPerUser.get(user.id!)! + 1)
  ));
}

var likesPerUser: Map<number, number> = new Map()
function updateUserLikes(id: number, likeCount) {
  likesPerUser.set(id, likeCount)
  rerender();
}

UserList(data.users, likesPerUser, updateUserLikes);
