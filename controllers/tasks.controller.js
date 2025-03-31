const db = require("../models");
const Task = db.tasks;
const User = db.users;

exports.getTasks = async (req, res) => {
  try {
    if (req.user) {
      const query = { userId: req.user.id };

      if (req.query.completed !== undefined) {
        query.completed = req.query.completed === "true";
      }

      if (req.query.verified !== undefined) {
        query.verified = req.query.verified === "true";
      }

      let tasks = await Task.find(query).exec();

      res.status(200).json({ success: true, tasks: tasks });
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao encontrar as tarefas.",
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    if (req.user) {
      let loggedUser = await User.findOne({ _id: req.user.id }).exec();
      if (loggedUser.partnerId) {
        const { title, description } = req.body;

        if (!title || !description) {
          return res.status(400).json({
            success: false,
            msg: "Por favor preencha todos os campos obrigatórios.",
          });
        }

        const newTask = await Task.create({
          userId: loggedUser.partnerId,
          title,
          description,
        });

        return res.status(201).json({
          success: true,
          msg: "Tarefa criada com sucesso!",
          task: newTask,
        });
      } else {
        return res.status(403).json({
          success: false,
          msg: "Tens de ter um parceiro para criar uma tarefa.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao criar a tarefa.",
    });
  }
};

exports.getCompleteTasks = async (req, res) => {
  try {
    if (req.user) {
      let loggedUser = await User.findOne({ _id: req.user.id }).exec();

      return res.status(200).json({
        success: true,
        msg: "Tarefas encontradas com sucesso!",
        completeTasks: loggedUser.completedTasks,
      });
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao criar a tarefa.",
    });
  }
};

exports.completeTask = async (req, res) => {
  try {
    if (req.user) {
      const taskId = req.params.id;

      let task = await Task.findOne({ _id: taskId }).exec();

      if (!task) {
        return res.status(404).json({
          success: false,
          msg: "Tarefa não encontrada.",
        });
      }

      if (task.userId === req.user.id) {
        task.completed = true;
        task.picture = req.body.picture;
        await task.save();

        return res.status(200).json({
          success: true,
          msg: "Tarefa marcada como concluída com sucesso!",
          task,
        });
      } else {
        return res.status(403).json({
          success: false,
          msg: "Esta tarefa não é tua.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao completar a tarefa.",
    });
  }
};

exports.verifyTask = async (req, res) => {
  try {
    if (req.user) {
      const taskId = req.params.id;
      let loggedUser = await User.findOne({ _id: req.user.id }).exec();
      let partnerUser = await User.findOne({
        _id: loggedUser.partnerId,
      }).exec();

      let task = await Task.findOne({ _id: taskId }).exec();

      if (!task) {
        return res.status(404).json({
          success: false,
          msg: "Tarefa não encontrada.",
        });
      }

      if (task.userId === loggedUser.partnerId) {
        if (req.body.verify == true) {
          task.completedDate = getFormattedDate();
          partnerUser.completedTasks.push(task.title);
          task.rejectMessage = "";

          await task.save();
          await partnerUser.save();
        } else if (req.body.verify == false) {
          task.completed = false;
          task.verified = false;
          task.completedDate = 0;
          task.rejectMessage = req.body.rejectMessage;
          task.picture = "";

          await task.save();
        }

        return res.status(200).json({
          success: true,
          msg: "Tarefa verificada com sucesso!",
          task,
        });
      } else {
        return res.status(403).json({
          success: false,
          msg: "Não podes verificar esta tarefa.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao verificar a tarefa.",
    });
  }
};

exports.removeRejectMessage = async (req, res) => {
  try {
    if (req.user) {
      const taskId = req.params.id;

      let task = await Task.findOne({ _id: taskId }).exec();

      if (!task) {
        return res.status(404).json({
          success: false,
          msg: "Tarefa não encontrada.",
        });
      }

      task.rejectMessage = "";

      await task.save();

      return res.status(200).json({
        success: true,
        msg: "Mensagem removida com sucesso!",
        task,
      });
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg:
        err.message || "Algum erro ocorreu ao eliminar a mensagem da tarefa.",
    });
  }
};

function getFormattedDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
