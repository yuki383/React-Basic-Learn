## Transformation

React の中心的な考え方として、UI は、データを別の形式に変換したものということ。  
純粋関数のように、ある入力は必ずある出力を返す。

```JavaScript
function NameBox(name: string) {
  return { fontWeight: "bold", labelContent: name };
}
```

```
'yamada tarou' ->
{ fontWeight: 'bold' , labelContent: 'yamada tarou' }
```

## Abstraction

複雑な UI を 1 つの関数に収めるのは難しい。だから、UI は実装の詳細を漏らさず、再利用できるコンポーネントとして抽象化することが重要。

```TypeScript
function FancyUserBox(user: { firstName: string; lastName: string }) {
  return {
    borderStyle: "1px solid blue",
    childContent: ["Name: ", NameBox(user.firstName + " " + user.lastName)],
  };
}
```

```
{ firstName: 'tarou', lastName: 'yamada' } ->
{
  borderStyle: '1px solid blue',
  childContent: [
    'Name: ',
    { fontWeight: 'bold', labelContent: 'Sebastian Markbåge' }
  ]
};
```

## Composition

本当に再利用可能にするには、葉ノードを再利用して新しいコンテナを作るだけじゃ不十分。
他の抽象化されたコンテナからコンポーネントを作成する必要がある。  
Composition とは、2 つ以上の別の Abstraction 組み合わせて新しいものを作り出すことらしい

```TypeScript
function FancyBox(children: any[]) {
  return {
    borderStyle: "1px solid blue",
    children: children,
  };
}

function UserBox(user: User) {
  return FancyBox([
    "Name: ",
    NameBox(user.firstName + " " + user.lastName
  )]);
}
```

## State

UI は単にサーバーやビジネスロジックをそのまま表示しているわけではなく、データに固有の状態とそうでない状態がある。  
例えば、テキストフィールドへの入力を他のタブやモバイル端末と同期することもあれば、同期せずにそれらでは空にする場合もある。  
典型的な例だと、スクロール位置などは、他のものと同期されることはほとんどない。

単一のもの(atom)として State を更新できる関数をスレッド化している。

```TypeScript
function FancyNameBox(user: User, likes: number, onClick: () => unknown) {
  return FancyBox([
    "Name: ",
    NameBox(user.firstName + " " + user.lastName),
    "Likes: ",
    LikeBox(likes),
    LikeButton(onClick),
  ]);
}

var likes = 0;
function addOneMoreLike() {
  likes++;
  rerender();
}

FancyNameBox(
  { firstName: "yamada", lastName: "tarou" },
  likes,
  addOneMoreLike
);
```

この例では、State を更新するために副作用が発生している。  
実際は、更新された後に次のバージョンのステートを返すというもの。(自信なし

## Memoization

純粋関数であると分かっているものを何度も同じ引数で呼び出すのは無駄。  
メモ化をすれば、同じ値を使い続けても関数を再実行しなくてよくなる。

```TypeScript
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
    MemoizedNameBox(user.firstName + ' ' + user.lastName),
    "Age in milliseconds: ",
    currentTime - user.dateOfBirth!,
  ])
}
```

## Lists

多くの UI はリストになっていて、各項目はそれぞれ違う内容を持っている。  
リスト内の各項目の State を管理するには、特定の項目の State を保持する Map を使う

```TypeScript
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
```
