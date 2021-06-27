

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemSchema = {
  name : String,
}

const listSchema ={
  name : String,
  items : [itemSchema]
}

const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name : "Welcome to your todo list",
})
const item2 = new Item({
  name : "Hit the + button to add a new item",
})
const item3 = new Item({
  name : "<--- Hit this to delete an item",
})

const defaultItems = [item1, item2, item3]



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length ===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err)
        }else{
          console.log("Successfully saved default items to db")
        }
      })
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});

app.get("/:customListName", function(req, res) {
const customListName = req.params.customListName;
List.findOne({name: customListName}, function(err,foundOne){
if(!err){
  if(!foundOne){
    const list = new List({
      name : customListName,
      items : defaultItems
    });
    list.save()
    res.redirect("/" + customListName)
  }else{
    res.render("list", {listTitle: foundOne.name, newListItems: foundOne.items});
  }
}
})

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName)

  const item = new Item({
    name : itemName
  });

  if (listName === "Today"){
    item.save()
    res.redirect("/")
  }else{
  List.findOne({name: listName}, function(err,foundList){
    foundList.items.push(item)
   foundList.save();
   res.redirect("/" + listName)
  })
  }
 
});

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = _.capitalize(req.body.listName);

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId , function(err){
      if(!err){
        console.log("Successfully deleted item")
        res.redirect("/")
      }
    })
  }else{
  List.findOneAndUpdate({name: listName},{$pull : {items: {_id : checkedItemId}}},function(err){
    if(!err){
      res.redirect("/" + listName)
    }
  })
  }

  
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
