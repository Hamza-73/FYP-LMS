const mongoose = require('mongoose');

const sharedRulesSchema = new mongoose.Schema({
    rule: [
        {
          role: { type: String, enum: ['student', 'supervisor', 'instructor'] },
          rules: [{ type: String }],
        },
      ],
});

const SharedRules = mongoose.model('SharedRules', sharedRulesSchema);

module.exports = SharedRules;