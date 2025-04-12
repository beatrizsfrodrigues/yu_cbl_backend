const db = require("../models");
const Task = db.tasks;
const User = db.users;
const Message = db.messages;

//* TODO: admin
exports.getTasks = async (req, res) => {
  try {
    if (req.user) {
      let query = req.user.role === "user" ? { userId: req.user.id } : {};

      if (req.user.role === "admin" && req.query.userId) {
        query.userId = req.query.userId;
      }

      if (req.query.completed) query.completed = req.query.completed === "true";
      if (req.query.verified) query.verified = req.query.verified === "true";

      let tasks = await Task.find(query).exec();

      res.status(200).json({ success: true, tasks });
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao encontrar as tarefas.",
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    if (req.user) {
      let loggedUser = await User.findOne({ _id: req.user.id }).exec();

      const chat = await Message.findOne({
        usersId: req.user.id,
      });

      if (loggedUser.partnerId) {
        const { title, description } = req.body;

        if (!title || !description) {
          return res.status(400).json({
            success: false,
            msg: "Por favor preenche todos os campos obrigatórios.",
          });
        }

        const newTask = await Task.create({
          userId: loggedUser.partnerId,
          title,
          description,
        });

        chat.messages.push({
          receiverId: loggedUser.partnerId,
          senderType: "app",
          message: `Tarefa <b>${title}</b> foi criada.`,
        });

        await chat.save();

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

exports.completeTask = async (req, res) => {
  try {
    if (req.user) {
      const taskId = req.params.id;

      let task = await Task.findOne({ _id: taskId }).exec();

      let loggedUser = await User.findOne({ _id: req.user.id }).exec();

      const chat = await Message.findOne({
        usersId: req.user.id,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          msg: "Tarefa não encontrada.",
        });
      }

      if (task.userId === req.user.id) {
        task.completed = true;
        task.picture = req.body.picture;
        task.notification = true;
        await task.save();

        chat.messages.push({
          receiverId: loggedUser.partnerId,
          senderType: "app",
          message: `Tarefa <b>${task.title}</b> foi marcada como completa.`,
        });

        await chat.save();

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

//* TODO: admin
exports.deleteTasks = async (req, res) => {
  try {
    if (req.user) {
      if (req.user.role == "admin") {
        const taskId = req.params.id;

        let task = await Task.findOne({ _id: taskId }).exec();

        if (!task) {
          return res.status(404).json({
            success: false,
            msg: "Tarefa não encontrada.",
          });
        }

        if (task.verified == true) {
          return res.status(403).json({
            success: false,
            msg: "Não tens permissão para apagar esta tarefa.",
          });
        } else {
          await Task.findByIdAndDelete(taskId);

          return res.status(200).json({
            success: true,
            msg: "Tarefa apagada com sucesso.",
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          msg: "Não tens permissão para aceder a esta rota.",
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
      msg: err.message || "Algum erro ocorreu ao apagar a tarefa.",
    });
  }
};

//* TODO: admin
exports.editTasks = async (req, res) => {
  try {
    if (req.user) {
      if (req.user.role == "admin") {
        const taskId = req.params.id;

        let task = await Task.findOne({ _id: taskId }).exec();

        if (!task) {
          return res.status(404).json({
            success: false,
            msg: "Tarefa não encontrada.",
          });
        }

        if (task.completed == true) {
          return res.status(403).json({
            success: false,
            msg: "Não tens permissão para editar esta tarefa.",
          });
        } else {
          const { title, description } = req.body;

          const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { title, description, completed, verified },
            { new: true, runValidators: true }
          );

          return res.status(200).json({
            success: true,
            msg: "Tarefa apagada com sucesso.",
            task: updatedTask,
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          msg: "Não tens permissão para aceder a esta rota.",
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
      msg: err.message || "Algum erro ocorreu ao editar a tarefa.",
    });
  }
};

exports.verifyTask = async (req, res) => {
  try {
    if (req.user) {
      const taskId = req.params.id;

      let loggedUser = await User.findOne({ _id: req.user.id }).exec();

      let task = await Task.findOne({ _id: taskId }).exec();

      const chat = await Message.findOne({
        usersId: req.user.id,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          msg: "Tarefa não encontrada.",
        });
      }

      let notification;

      if (task.userId === loggedUser.partnerId) {
        if (req.body.verify == true) {
          task.completedDate = getFormattedDate();
          task.verified = true;
          task.rejectMessage = "";
          notification = "aceite.";

          await task.save();
        } else if (req.body.verify == false) {
          task.completed = false;
          task.verified = false;
          task.completedDate = 0;
          task.rejectMessage = req.body.rejectMessage;
          task.picture = "";
          notification = `rejeitada. Foi deixada esta mensagem: ${req.body.rejectMessage}`;

          await task.save();
        }

        chat.messages.push({
          receiverId: loggedUser.partnerId,
          senderType: "app",
          message: `Tarefa <b>${task.title}</b> foi ${notification}`,
        });

        await chat.save();

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

      if (task.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          msg: "Não tens permissão para aceder a esta tarefa.",
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

//* TODO: notifications
exports.notifyTasks = async (req, res) => {
  try {
    if (req.user) {
      const taskId = req.params.id;

      let task = await Task.findOne({ _id: taskId }).exec();

      let partner = await User.findOne({ _id: task.userId }).exec();

      if (!task) {
        return res.status(404).json({
          success: false,
          msg: "Tarefa não encontrada.",
        });
      }

      if (req.user.id !== partner.partnerId) {
        return res.status(403).json({
          success: false,
          msg: "Não tens permissão para aceder a esta tarefa.",
        });
      } else {
        task.notification = false;
        await task.save();

        return res.status(200).json({
          success: true,
          msg: "Notificação removida com sucesso!",
          task,
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
      msg: err.message || "Algum erro ocorreu ao encontrar as tarefas.",
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
