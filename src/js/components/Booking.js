import {
  select,
  templates
} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    //Konstruktor klasy Booking ma:
    // wywoływać metodę render, przekazując jej argument, który otrzymuje z app.initBooking,
    thisBooking.render(element);
    // wywoływać metodę initWidgets bez argumentów.
    thisBooking.initWidgets();
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
  }

  initWidgets() {
    const thisBooking = this;

    // we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom.
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    // w metodzie initWidgets stwórz nową instancję klasy DatePicker zapisując ją do właściwości thisBooking.datePicker, analogicznie jak zrobiliśmy to dla obu instancji AmountWidget.
    thisBooking.dtepicker = new DatePicker(thisBooking.dom.datePicker);
  }
}

export default Booking;
