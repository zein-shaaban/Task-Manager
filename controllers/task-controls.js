require("dotenv").config();
const Task = require("../models/task-model");
const User = require("../models/user-model");
const asyncWrapper = require("../MiddleWares/asyncWrapper");
const ApiError = require("../utils/ApiError");
const taskValidator = require("../MiddleWares/taskValidator");

const getTasks = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.UserId).populate({
    path: "tasks",
    options: { sort: { date: "asc" } },
  });
  res.status(200).json({
    status: 1,
    data: user,
  });
});

const addtask = asyncWrapper(async (req, res) => {
  const {
    value: { content, date, important, completed },
    error,
  } = taskValidator.addTaskValidate(req.body);
  if (error) {
    throw new ApiError(error.details[0].message);
  }
  const user = await User.findById(req.UserId);
  const newTask = await Task.create({
    content,
    date,
    last_updated: date,
    user,
    important,
    completed,
  });
  user.tasks.push(newTask);
  await user.save();
  res.status(201).json({
    status: 1,
    data: { id: newTask._id },
  });
});

const deleteTask = asyncWrapper(async (req, res) => {
  const {
    value: { ids },
    error,
  } = taskValidator.deleteTasksValidate(req.body);
  if (error) {
    throw new ApiError(error.details[0].message);
  }
  const user = await User.findById(req.UserId);
  for (let id of ids) {
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw new ApiError(`this task id is not exist ${id}`, 404);
    const index = user.tasks.indexOf(id);
    user.tasks.splice(index, 1);
    await user.save();
  }
  res.status(202).json({
    status: 1,
    data: null,
  });
});

const updatetask = asyncWrapper(async (req, res) => {
  const {
    value: { id, content, last_updated, important, completed },
    error,
  } = taskValidator.updateTaskValidate({ id: req.params.id, ...req.body });
  if (error) {
    throw new ApiError(error.details[0].message);
  }
  const task = await Task.findByIdAndUpdate(
    id,
    { content, last_updated, important, completed },
    { new: true, runValidators: true }
  );
  if (task)
    return res.status(203).json({
      status: 1,
      data: null,
    });
  throw new ApiError("the task id is not exist", 404);
});

const deleteCompletedTasks = asyncWrapper(async (req, res) => {
  await Task.deleteMany({
    completed: 1,
    date: { $lt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
  });
  res.send("Delete");
});

module.exports = {
  getTasks,
  addtask,
  deleteTask,
  updatetask,
  deleteCompletedTasks,
};
