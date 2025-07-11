const db = require("../models");
const Task = db.tasks;
const User = db.users;
const Message = db.messages;

exports.getTasksStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        msg: req.user
          ? "Não tens permissão para aceder a esta rota."
          : "Tens de ter um token para aceder a esta rota.",
      });
    }
    const totalTasks = await Task.countDocuments({});
    const totalCompletedTasks = await Task.countDocuments({ completed: true });

    return res.status(200).json({
      success: true,
      totalTasks,
      totalCompletedTasks,
    });
  } catch (err) {
    console.error("Erro em getTasksStats:", err);
    return res.status(500).json({
      success: false,
      msg: err.message || "Erro ao obter estatísticas de tarefas.",
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }

    const requestedUserId = req.query.userId;
    let query = {};

    if (req.user.role === "user") {
      const loggedUser = await User.findById(req.user.id).exec();
      if (!loggedUser) {
        return res.status(404).json({
          success: false,
          msg: "Utilizador não encontrado.",
        });
      }

      const ownId = loggedUser._id.toString();

      const partnerId = loggedUser.partnerId
        ? loggedUser.partnerId.toString()
        : null;

      const allowedIds = partnerId ? [ownId, partnerId] : [ownId];

      if (requestedUserId && !allowedIds.includes(requestedUserId)) {
        return res.status(403).json({
          success: false,
          msg: "Não tens permissão para ver tarefas deste utilizador.",
        });
      }

      if (!requestedUserId) {
        query.userId = req.user.id;
      } else {
        query.userId = requestedUserId;
      }

      if (!allowedIds.includes(query.userId)) {
        return res.status(403).json({
          success: false,
          msg: "Não tens permissão para ver tarefas deste utilizador.",
        });
      }
    }

    if (req.user.role === "admin" && req.query.userId) {
      query.userId = req.query.userId;
    }

    if (req.query.completed) {
      query.completed = req.query.completed === "true";
    }
    if (req.query.verified) {
      query.verified = req.query.verified === "true";
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    console.log("limit", limit);
    console.log("page", page);
    console.log("Query:", query);

    return res.status(200).json({
      success: true,
      tasks,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Erro em getTasks:", err);
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

      const chat = await Message.findOne({
        usersId: req.user.id,
      });

      if (loggedUser.partnerId) {
        const { title, description } = req.body;
        console.log(req.body);

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
    console.log(err);
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

      if (task.userId.toString() === req.user.id) {
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

      let partner = await User.findOne({ _id: loggedUser.partnerId }).exec();

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

      if (task.userId.toString() === loggedUser.partnerId.toString()) {
        if (req.body.verify == true) {
          task.completedDate = getFormattedDate();
          task.verified = true;
          task.rejectMessage = "";
          notification = "aceite.";
          partner.points += 10;

          await task.save();
          await partner.save();
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
    console.log(req.params.id);
    console.log(req.user);
    if (req.user) {
      const taskId = req.params.id;

      let task = await Task.findOne({ _id: taskId }).exec();

      if (!task) {
        return res.status(404).json({
          success: false,
          msg: "Tarefa não encontrada.",
        });
      }

      if (task.userId.toString() !== req.user.id.toString()) {
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

      if (req.user.id.toString() !== partner.partnerId.toString()) {
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
