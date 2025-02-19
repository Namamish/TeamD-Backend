const { sendError, validateID } = require('../../utils');
const Event = require('../../models/research/events');

const createTimeStamp = (date, time) => {
    // date and time are strings in DD-MM-YYYY and HH:MM format
    const dateParts = date.split('-');
    const timeParts = time.split(':');

    const dateTime = new Date(
        parseInt(dateParts[2]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[0]),
        parseInt(timeParts[0]),
        parseInt(timeParts[1])
    );

    return dateTime;

};

const getAllevents = (req, res) => {
    // filter by req.query.visible if it is not all
    let filter = {};

    //filter by req.query
    if (req.query.category !== 'all') {
        filter.category = req.query.category;
    }
    if (req.query.visible === 'visible') {
        filter.visible = true;
    } else if (req.query.visible === 'hidden') {
        filter.visible = false;
    } else if (req.query.visible !== 'all') {
        return sendError(res, `Invalid value for visible: ${req.query.visible}`);
    }
    
    // filter upcoming and past events
    if (req.query.upcoming === 'true') {
        filter.dateTime = { $gte: new Date() };
    } else if (req.query.upcoming === 'false') {
        filter.dateTime = { $lt: new Date() };
    } else if (req.query.upcoming !== 'all') {
        return sendError(res, `Invalid value for upcoming: ${req.query.upcoming}`);
    }
    
    Event
        .find(filter)
        .sort({ updatedAt: -1 })
        .then((events) => res.json(events))
        .catch((err) => sendError(res, err));
};

const createevent = (req, res) => {
    // create timestamp from date and time
    req.body.dateTime = createTimeStamp(req.body.date, req.body.time);

    // delete date and time from req.body
    delete req.body.date;
    delete req.body.time;

    const newevent = new Event(req.body);

    newevent.save()
        .then((createdevent) => res.status(201).json(createdevent))
        .catch((err) => sendError(res, err));
};

const geteventByID = (req, res) => {
    const id = req.query.id;

    if (!validateID(id)) {
        return sendError(res, `Invalid ID: ${id}`);
    }

    Event
        .findById(id)
        .then((event) => {
            if (!event) {
                return sendError(res, `event not found with ID: ${id}`);
            }

            res.json(event);
        })
        .catch((err) => sendError(res, err));
};

const updateeventByID = (req, res) => {
    const id = req.query.id;

    if (!validateID(id)) {
        return sendError(res, `Invalid ID: ${id}`);
    }

    req.body.updatedAt = Date.now();
    Event
        .findByIdAndUpdate(id, req.body, { new: true })
        .then((updatedevent) => {
            if (!updatedevent) {
                return sendError(res, `event not found with ID: ${id}`);
            }

            res.json(updatedevent);
        })
        .catch((err) => sendError(res, err));
};

const hideeventByID = (req, res) => {
    const id = req.query.id;

    if (!validateID(id)) {
        return sendError(res, `Invalid ID: ${id}`);
    }

    Event
        .findByIdAndUpdate(id, { visible: false , disabledAt: Date.now() }, { new: true })
        .then((updatedevent) => {
            if (!updatedevent) {
                return sendError(res, `event not found with ID: ${id}`);
            }

            res.json(updatedevent);
        })
        .catch((err) => sendError(res, err));
};

const deleteeventByID = (req, res) => {
    const id = req.query.id;

    if (!validateID(id)) {
        return sendError(res, `Invalid ID: ${id}`);
    }

    Event
        .findByIdAndDelete(id)
        .then((deletedevent) => {
            if (!deletedevent) {
                return sendError(res, `event not found with ID: ${id}`);
            }

            res.json(deletedevent);
        })
        .catch((err) => sendError(res, err));
};

module.exports = {
    getAllevents,
    createevent,
    geteventByID,
    updateeventByID,
    hideeventByID,
    deleteeventByID
};