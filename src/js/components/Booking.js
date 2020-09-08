import { select, templates, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

export class Booking {
  constructor() {
    const thisBooking = this;

    thisBooking.render(thisBooking.bookingWrapper);
    thisBooking.initWidget();
    thisBooking.getData();
    thisBooking.tableSelect();
  }

  render(element) {
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    const generateHTML = templates.bookingWidget();
    thisBooking.element = utils.createDOMFromHTML(generateHTML);
    const bookingContainer = document.querySelector(select.containerOf.booking);
    bookingContainer.appendChild(thisBooking.element);

    thisBooking.dom.wrapper = thisBooking.element;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.rangeSlider = thisBooking.dom.wrapper.querySelector(select.booking.rangeSlider);
  }

  initWidget() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function ([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        console.log(bookings);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    console.log(bookings, eventsCurrent, eventsRepeat);
    thisBooking.booked = {};

    console.log('thisBooking.booked', thisBooking.booked);
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let eventCurrent of eventsCurrent) {
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
    }

    for (let book of bookings) {
      thisBooking.makeBooked(book.date, book.hour, book.duration, book.table);
    }

    for (let eventRepeat of eventsRepeat) {
      if (eventRepeat.repeat == 'daily') {
        for (let i = minDate; i <= maxDate; i = utils.addDays(i, 1)) {
          thisBooking.makeBooked(utils.dateToStr(i), eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    const startHour = utils.hourToNumber(hour);

    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {};
    }

    for (let i = startHour; i < startHour + duration; i += 0.5) {
      if (typeof thisBooking.booked[date][i] === 'undefined') {
        thisBooking.booked[date][i] = [];
      }
      thisBooking.booked[date][i].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let domTables of thisBooking.dom.tables) {
      let tableID = domTables.getAttribute(settings.booking.tableIdAttribute);
      tableID = parseInt(tableID);

      if (thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableID)) {
        domTables.classList.add(classNames.booking.tableBooked);
      } else {
        domTables.classList.remove(classNames.booking.tableBooked);
        domTables.classList.remove(classNames.booking.tableUnbooked);
      }
    }

    thisBooking.rangeColor();
  }

  tableSelect() {
    const thisBooking = this;

    for (let domTables of thisBooking.dom.tables) {
      let tableID = domTables.getAttribute(settings.booking.tableIdAttribute);
      tableID = parseInt(tableID);

      domTables.addEventListener('click', function () {
        if (domTables.classList.contains(classNames.booking.tableBooked)) {
          alert('Table is booked!');
        } else if (!domTables.classList.contains(classNames.booking.tableUnbooked)) {
          domTables.classList.add(classNames.booking.tableUnbooked);
          console.log('Blooked');
          console.log('thisBooking.tableUnbooked', tableID);
        } else {
          domTables.classList.remove(classNames.booking.tableUnbooked);
          console.log('Unblooked');
        }

        thisBooking.tableUnbooked = tableID;
        console.log('thisBooking.tableUnbooked', tableID);
      });
    }
  }



  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    let isChecked = false;

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.tableUnbooked,
      duration: thisBooking.hoursAmount.value,
      people: thisBooking.peopleAmount.value,
      phone: parseInt(thisBooking.dom.phone.value),
      mail: thisBooking.dom.address.value,
      starters: [],
    };

    for (let domStarter of thisBooking.dom.starters) {
      if (!domStarter.checked === isChecked) {
        payload.starters.push(domStarter.value);
        console.log('payload.starters', payload.starters);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse booking', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        thisBooking.updateDOM();
        window.location.reload();
      });
  }
}

export default Booking;


