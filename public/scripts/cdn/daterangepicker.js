$(function () {
  
  $('input[name="datefilter"]').daterangepicker({

    locale: {
      format: 'DD/MM/YYYY',
      cancelLabel: 'Annulla',
      "daysOfWeek": [
        "Do",
        "Lu",
        "Ma",
        "Me",
        "Gio",
        "Ve",
        "Sa"
      ],
      "monthNames": [
        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre"
      ],
      "opens": "center"

    },
    autoUpdateInput: true,

    ranges: {
      'Oggi': [moment(), moment()],
      'Ieri': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'L altro ieri': [moment().subtract(2, 'days'), moment().subtract(2, 'days')],
      'Venerdì precedente': [moment().day(-2), moment().day(-2)],
      'Ultimi 7 Giorni': [moment().subtract(6, 'days'), moment()],
      'Ultimi 30 Giorni': [moment().subtract(29, 'days'), moment()],
      'Questo Mese': [moment().startOf('month'), moment().endOf('month')],
      'Mese Precedente': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  });
  $('input[name="datefilter"]').on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
  });
  $('input[name="datefilter"]').on('cancel.daterangepicker', function (ev, picker) {
    $(this).val('');
  });
});