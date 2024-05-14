import express from "express";
const app=express();
const port=3000;
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use((req,res,next)=>{
    res.locals.isAuthenticated=isAuthenticated;
    next();
})
const blogposts =[
    {id:1, title : "learning Javascript",Comments:[]},
    {id:2, title :"Mern Stack",Comments:[]},
    {id:3, title : "learning nodejs",Comments:[]},
];
let isAuthenticated = false;
app.get("/",(req,res)=>{
    res.render("./pages/index.ejs",{blogposts,isAuthenticated});
});
app.get('/pages/:id',(req,res)=>{
    const postid=req.params.id;
    const post=blogposts.find((post)=> post.id==postid);
    if(post){
        res.render(`pages/post${post.id}`,{post,isAuthenticated});
    }
    else{
        res.status(404).render("pages/404.ejs");
    }
});
app.get("/login",(req,res)=>{
    res.render("pages/login");
});
app.post("/login",(req,res)=>{
    const {username, password}=req.body;
    if(username==="Raj" && password==="123456"){
        isAuthenticated=true;
        res.redirect("/");
    }
    else{
        res.render("/pages/failure");
    }
})
app.post("/comment/:id",(req,res)=>{
    const postid=req.params.id;
    const post=blogposts.find((post)=> post.id==postid);
    if(!isAuthenticated){
        return res.redirect('/pages/404.ejs');
    }
    if(post){
        const comment=req.body.comment;
        if(comment){
            post.Comments.push(comment);
        }
        return res.redirect(`/pages/${postid}`);
    }
    else{
        res.status(404).render("pages/404.ejs");
    }
    
});
app.get('/logout',(req,res)=>{
    isAuthenticated=false;
    res.redirect("/");
})
app.listen(port,()=>{
    console.log(`port is listening on ${port}`);
})