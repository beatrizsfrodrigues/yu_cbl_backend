const db = require("../models");
const Task = db.tasks;

exports.getTasks = async (req, res) => {
  try {
    let tasks = await Task.find().exec();
    res.status(200).json({ success: true, tasks: tasks });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while retrieving all tasks.",
    });
  }
};
