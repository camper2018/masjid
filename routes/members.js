const express = require('express');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const Member = require('../models/Member');

const ObjectID = mongodb.ObjectID;

// Get all members
router.get('/', ensureAuth, async (req, res) => {
    try {
        const members = await Member.find({})
            .populate('user')
            .sort('Street')
            .lean();

        return res.send(members);            

    } catch (error) {
        console.error(error);
        // return server error
        return res.status(500);
    }
});

// Get a member
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let member = await Member.findById(req.params.id) //use this function call to get dependents
            .populate('user')
            .lean(); //try removing this and look at data

        if (!member) {
            return res.status(404).send('Not found.');
        }

        if(member.Dependents.length > 0){
            let dependents = [];
            for (let index = 0; index < member.Dependents.length; index++) {
                let temp = await Member.findById(member.Dependents[index]);
                dependents.push(temp);
            }
            member.Dependents = dependents;
        }

        return res.send(member);

    } catch (error) {
        console.error(error);
        // return server error
        return res.status(500);
    }
});
//returns member
//want to return member object + array of dependent objects in member.dependents



// Create a new member
router.post('/', ensureAuth, async (req, res) => {
    try {
        const m = req.body; // member
        if (!m.Firstname || m.Firstname.length < 1 ||
          !m.Lastname || m.Lastname.length < 1 ||
          !m.HouseNo || m.HouseNo.length < 1 ||
          !m.Street || m.Street.length < 1) {
              return res.status(400).send("Member not valid");
          }

        //req.body.req.user.id;
        console.log(m);
        const member = await Member.create(m);
        if (member) {
            return res.status(200).send(member);
        } else {
            return res.status(500);
        }

    } catch (error) {
        console.error(error);
        // return server error
        return res.status(500);
    }
});

// Update existing member
router.put('/:id', ensureAuth, async (req, res) => {
    try {

        const m = req.body;

        if(m.Dependents.length > 0 && typeof m.Dependents[0] !== "string"){
            let dependents = [];
            await m.Dependents.forEach(dep => dependents.push(dep._id));
            m.Dependents = dependents;
        }

        const member = await Member.findOneAndUpdate({_id: req.params.id}, m, {
            new: true,
            runValidators: true
        })
        .populate('user')
        .lean();

        if (!member) {
            res.status(404).send("Member not found");
        }

        return res.send(member);
        
    } catch (error) {
        console.error(error);
        // return server error
        return res.status(500);
    }
});

// Delete a member
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id)
        .populate('user')
        .lean();

        if (!member) {
            return res.status(404).send("Member not found");
        }

        return res.send(member);
        
    } catch (error) {
        console.error(error);
        // return server error
        return res.status(500);
    }
});

// Member stats
router.get('/stats', ensureAuth, async (req, res) => {
    try {
        const members = await Member.find({})
            .populate('user')
            .sort('Street')
            .lean();

        const stats = {
            numberOfMembers: members.length,
            numberOfStreets: 2,
            mostPopularStreet: "dfdsfd",
            newestMembers: "",
            newestMemberAddTime: Date.now,
            lastTimeListChanged: Date.now
        }

        res.status(200).send(stats);

    } catch (error) {
       console.error(error);
       return res.status(500); 
    }
});


module.exports = router; 