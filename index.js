let express = require("express")
let bodyParser = require("body-parser")
let validator = require('validator')
let dbHandler = require('./dbHandler.js')
let auth = require('./authHandler.js')
let expressMongoDb = require('express-mongo-db');
const port = process.env.PORT || 80;

app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
let mongo-options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
  };
app.use(expressMongoDb('mongodb+srv://api-user-new:titanscout2022@2022-scouting-4vfuu.mongodb.net/test?retryWrites=true&w=majority', mongo-options));


app.get('/', (req, res) => {
    res.send("API live")
    res.status(200)
})

app.post("/api/addUserToTeam", auth.checkAuth, (req, res) => {
    let err = false;
    const id = res.locals.id
    const team = parseInt(validator.escape(req.body.team))
    const position = String(validator.escape(req.body.position))
    val = dbHandler.addUserToTeam(req.db, id, team, position)
    resobj = {
        "success": !err,
        "id": res.locals.id,
        "team": req.body.team,
        "position": req.body.position
    }
    res.json(resobj)
})
app.post("/api/getCompetitions", auth.checkAuth, (req, res) => {
    let err = false;
    const id = res.locals.id
    val = dbHandler.getCompetitions(req.db, id)
    resobj = {
            "success": !err,
            "id": res.locals.id,
            "team": val.team,
            "competitions": val.competitions
    }
    res.json(resobj)
})
app.post("/api/submitMatchData", auth.checkAuth, (req, res) => {
    let err = false;
    try{
        const id = res.locals.id
        const competition_id = String(validator.escape(req.body.competition_id))
        const match_number = parseInt(validator.escape(req.body.match_number))
        const team_scouted = parseInt(validator.escape(req.body.team_scouted))
        const data = req.body.data
        val = dbHandler.addUserToTeam(id, competition_id, match_number, team_scouted, data)
        resobj = {}
        if (val != 0)
        {
            throw new Error('Error adding to DB')
        }
        } catch (error) {
            err = true; 
            resobj = {"success": !err}
            console.log(error)
        }
        if (err == false) { // do not change this line to a boolean operator, random JS errors can cause it to work unexpectedly (because JS). 
            resobj = {
                "success": !err
            }
        }
        res.json(resobj)
})
app.listen(port, () => console.log(`Listening on port ${port}`))