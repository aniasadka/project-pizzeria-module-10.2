import {
  select,
  templates,
  settings
} from '../settings.js';
import {
  utils
} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;

    //Konstruktor klasy Booking ma:
    // wywoływać metodę render, przekazując jej argument, który otrzymuje z app.initBooking,
    thisBooking.render(element);
    // wywoływać metodę initWidgets bez argumentów.
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],

      eventsCurrent: [
        settings.db.noRepeatParam,
        startDateParam,
        endDateParam,
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);


    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls', urls);

    Promise.all([
        fetch(urls.booking),
        fetch(urls.eventsCurrent),
        fetch(urls.eventsRepeat),
      ])

      .then(function (allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
      });
  }
}



render(element) {
  const thisBooking = this;

  //Metoda Booking.render ma za zadanie:
  //generować kod HTML za pomocą szablonu templates.bookingWidget bez podawanie mu jakiegokolwiek argumentu,
  const generatedHTML = templates.bookingWidget();

  //tworzyć pusty obiekt thisBooking.dom,
  thisBooking.dom = {};
  //zapisywać do tego obiektu właściwość wrapper równą otrzymanemu argumentowi,
  thisBooking.dom.wrapper = element;
  //zawartość wrappera zamieniać na kod HTML wygenerowany z szablonu,
  thisBooking.dom.wrapper.innerHTML = generatedHTML;

  //we właściwości thisBooking.dom.peopleAmount zapisywać pojedynczy element znaleziony we wrapperze i pasujący do selektora select.booking.peopleAmount,
  thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
  // analogicznie do peopleAmount znaleźć i zapisać element dla hoursAmount.
  thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

  // W klasie Booking w metodzie render stwórz właściwość thisBooking.dom.datePicker i zapisz w niej element pasujący do selektora zapisanego w select.widgets.datePicker.wrapper, wyszukany we wrapperze zapisanym w tej klasie
  thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
  thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
}

initWidgets() {
  const thisBooking = this;

  // we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom.
  thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
  thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

  // w metodzie initWidgets stwórz nową instancję klasy DatePicker zapisując ją do właściwości thisBooking.datePicker, analogicznie jak zrobiliśmy to dla obu instancji AmountWidget.
  thisBooking.datepicker = new DatePicker(thisBooking.dom.datePicker);
  thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
}


export default Booking;
