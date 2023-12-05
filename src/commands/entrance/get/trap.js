const pool = require('../../../database/db-promise');
const student = require('./student');
const obstacle = require('./obstacle');
const update = require('../embed/screen');
const cant_pass = require('./cant_pass');

async function trap(origin,interaction,steps,dice,rep) {
    
    let random = Math.floor(Math.random() * (4 - 1) + 1);
    if (random == 1)
    {
      await obstacle(interaction,steps,dice,rep);
    }
    else if (random == 2)
    {
        await student(interaction, steps, dice, rep);
    }
    else
    {
        await cant_pass(interaction, steps, dice, rep);
    }
    await update(origin);
}

module.exports = trap;