const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const appControllers = require('@/controllers/appControllers');
const { routesList } = require('@/models/utils');
const { requireRole } = require('@/middlewares/roleMiddleware');

const routerApp = (entity, controller) => {
  // Payment routes are admin-only
  const entityMiddleware =
    entity === 'payment' ? requireRole('admin') : (req, res, next) => next();

  router.route(`/${entity}/create`).post(entityMiddleware, catchErrors(controller['create']));
  router.route(`/${entity}/read/:id`).get(entityMiddleware, catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(entityMiddleware, catchErrors(controller['update']));
  router
    .route(`/${entity}/delete/:id`)
    .delete(entityMiddleware, catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(entityMiddleware, catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(entityMiddleware, catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(entityMiddleware, catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(entityMiddleware, catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(entityMiddleware, catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(entityMiddleware, catchErrors(controller['mail']));
  }

  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller['convert']));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

module.exports = router;
