/** librerie */
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const moment = require('moment');
const axios = require('axios');


/** Database */
const UBICAZIONE = require('./../../../../models/ubicazione');
const MOVIMENTI = require('./../../../../models/movimenti');
const ZMAT = require('./../../../../models/zmat');
const USER = require('./../../../../models/user');
const MARD = require('./../../../../models/mard');


/** extensions+middleware */
const sendmail = require('./../../../extensions/nodemailer');
const logger = require('./../../../extensions/logger');
// todo sarebbe carino fare un middleware stile isLoggedInFromDart()


module.exports = router;

/**
 * permette di eseguire una ricerca in magazzino tramite app
 * riceve in input una delle seguenti combinazioni
 * l'utente
 * 1) codice + utente
 * 2) ubicazione +utente
 * 3) ubicazione + codice + utente
 *
 * e in base alla combinazione che riceve, 
 * crea la query e restituisce i risultati.
 *
 */
router.get('/search', async function (req, res) {

  let utente = req.query.utente || null;
  let codice = req.query.codice || null;
  let ubicazione = req.query.ubicazione || null;
  let magazzino = req.query.magazzino || null;
  var query = {};
  if (codice == '') {
    codice = null;
  }
  if (ubicazione == '') {
    ubicazione = null;
  }
  if (magazzino == '') {
    magazzino = 'ALL';
  }

  if (utente == '') {
    utente = null;
    return res.json({
      err: 'Utente non loggato, non posso procedere con la ricerca',
      risultati: null,
    });
  }
  const user = await USER.findOne({
    'username': utente.toString(),
  });
  if (codice != null && ubicazione != null && user != null) {
    codice = codice.trim();
    codice = codice.toUpperCase();
    ubicazione = ubicazione.trim();
    ubicazione = ubicazione.toUpperCase();
    query = {
      articolo: {
        $regex: '.*' + codice + '.*',
      },
      ubicazione: {
        $regex: '.*' + ubicazione + '.*',
      },
    };
    if (magazzino != 'ALL') {
      query.magazzino = magazzino;
    }
  } else if (codice == null && ubicazione != null && user != null) {
    ubicazione = ubicazione.trim();
    ubicazione = ubicazione.toUpperCase();
    query = {
      ubicazione: {
        $regex: '.*' + ubicazione + '.*',
      },
    };
    if (magazzino != 'ALL') {
      query.magazzino = magazzino;
    }
  } else if (codice != null && ubicazione == null && user != null) {
    codice = codice.trim();
    codice = codice.toUpperCase();
    query = {
      articolo: {
        $regex: '.*' + codice + '.*',
      },
    };
    if (magazzino != 'ALL') {
      query.magazzino = magazzino;
    }
  } else {

    return res.json({
      err: 'Query non presente',
      risultati: null,
    });
  }
  try {

    let risultati = await UBICAZIONE.find(query).lean();

    if (risultati.length == 0) {
      risultati[0] = {
        _id: '614035 eb89f9 8cbf88b3 78e0',
        armadio: 'N',
        ripiano: '0',
        posizione: 'UBI',
        // descrizione: 'Articolo non trovato nel sistema',
        articolo: codice,
        datapart: '19000101',
        datainserimento: '01/01/1900 00:00:00',
        ubicazione: 'N0UBI',
        magazzino: 'NON TROVATO',
        __v: 0,
      };


      const stockk = await MARD.findOne({
        'MATNR': codice.toString()
      }).lean();

      const descrizione = await ZMAT.findOne({
        'MATNR': codice.toString()
      }).lean();


      if (descrizione) {
        risultati[0]['descrizione'] = descrizione.MAKTX;
      }
      if (stockk) {
        risultati[0]['stock'] = stockk;
      } else {
        risultati[0]['stock'] = {
          _id: '61 bb5ef f2ea 8c125 5c83 1a94',
          MATNR: codice,
          LGORT: '1010',
          LABST: '0.000',
          INSME: '0.000',
          __v: 0,
        };
      }
    } else {

      for (let i = 0; i < risultati.length; i++) {
        risultati[i]['stock'] = new Object();
        risultati[i]['articolo'] = risultati[i]['articolo'].trim();
        risultati[i]['stock'] = await MARD.findOne({
          'MATNR': risultati[i]['articolo'].toString(),
        }).lean();
        if (risultati[i]['stock'] == null) {
          risultati[i]['stock'] = new Object();

          risultati[i]['stock']['INSME'] = '0.000';
          risultati[i]['stock']['LABST'] = '0.000';
          risultati[i]['stock']['LABST'] = '0.000';
          risultati[i]['stock']['LGORT'] = '1010';
        }
      };
    }
    for (let i = 0; i < risultati.length; i++) {
      if (risultati[i].hasOwnProperty('tipo') == false) {
        risultati[i]['tipo'] = 'nuovo';
      }
    }

    risultati = risultati.sort(compare);


    return res.json({
      err: null,
      risultati: risultati,
    });
  } catch (err) {

    logger.error(err.message);
    return res.json({
      err: err,
      risultati: null,
    });
  }
});

function compare(a, b) {
  if (a.tipo < b.tipo) {
    return 1;
  }
  if (a.tipo > b.tipo) {
    return -1;
  }
  return 0;
}

/**
 * permette di ubicare nel magazzino tramite app
 *
 *
 */
router.get('/insert', async function (req, res) {

  let tipo = req.query.tipo || null;
  let codice = req.query.codice || null;
  let locazione = req.query.ubicazione || null;
  let utente = req.query.utente || null;
  let data = req.query.data.substr(0, 10);
  const tbsmagazzino = req.query.magazzino || null;
  let quantita = req.query.quantita || 0;
  let um = req.query.unita || null;

  if (codice && locazione && utente) {
    const regex = /[^A-Za-z0-9.]/g;
    codice = codice.toUpperCase();
    codice = codice.trim();
    codice = codice.replace(regex, '');

    locazione = locazione.toUpperCase();
    locazione = locazione.trim();
    utente = utente.toUpperCase();
    utente = utente.trim();
    data = moment(data, 'YYYY-MM-DD').format('YYYYMMDD');
    quantita = parseInt(quantita);
    const user = await USER.findOne({
      'username': utente.toString(),
    });

    if (tipo && (tipo === 'nuovo' || tipo === 'ritorno')) {
    } else {
      tipo = 'nuovo';
    }
    let magazzino = tbsmagazzino.toString() || "ALL";
    if (magazzino == 'ALL') {
      magazzino = user.magazzino;
    }

    if (locazione.length == 5) {
      try {
        var anagrafica = await ZMAT.findOne({
          'MATNR': codice.toString(),
        }).lean();
      } catch (err) {
        logger.error(JSON.stringify(err.message));
        sendmail('Inserimento Ubicazione', JSON.stringify(err.message));
        return res.json({
          type: 'error',
          message: JSON.stringify(err.message),
        });
      }

      if (anagrafica) {
        var descrizione = anagrafica.MAKTX.toString();
      } else {
        var descrizione = 'non trovato';
      };


      const armadio = locazione[0];
      const ripiano = locazione[1];
      const posizione = locazione[2] + '' + locazione[3] + '' + locazione[4];

      const newData = {
        armadio: armadio.toString(),
        um: um.toString(),
        ripiano: ripiano.toString(),
        posizione: posizione.toString(),
        descrizione: descrizione.toString(),
        articolo: codice.toString(),
        datapart: data,
        datainserimento: moment().format('DD/MM/YYYY HH:mm:ss'),
        ubicazione: armadio.toString()+ '' + ripiano.toString() + '' + posizione.toString(),
        magazzino: magazzino.toString(),
        quantita: quantita,
        ubicatore: user,
        tipo: tipo.toString(),
        dataultimaqta: moment().format("DD/MM/YYYY HH:mm:ss"),
        autoreultimaqta: user.username.toString(),
      };




      try {
        const inserito = await UBICAZIONE.create(newData);
      } catch (err) {
        logger.error(JSON.stringify(err.message));
        sendmail('Inserimento Ubicazione', JSON.stringify(err.message));
        return res.json({
          type: 'error',
          message: JSON.stringify(err.message),
        });
      }

      const movimento = {
        data: moment().format('DD/MM/YYYY HH:mm:ss'),
        datapart: moment().format('YYYYMMDD'),
        codicearticolo: codice.toString(),
        movimento: 'add',
        ubicazione: armadio.toString() + '' + ripiano.toString() + '' + posizione.toString(),
        author: user,
        magazzino: magazzino.toString(),
      };

      try {
        const x = await MOVIMENTI.create(movimento);
      } catch (err) {
        logger.error(JSON.stringify(err.message));
        sendmail('Creazione movimento da ubicazione tramite api', JSON.stringify(err.message));
        return res.json({
          type: 'error',
          message: JSON.stringify(err.message),
        });
      }

      try {
        const trovati = await UBICAZIONE.find({
          'articolo': codice.toString(),
          'magazzino': magazzino.toString()
        }).lean();


        for (let i = 0; i < trovati.length; i++) {
          trovati[i]['stock'] = new Object();
          trovati[i]['articolo'] = trovati[i]['articolo'].trim();
          trovati[i]['stock'] = await MARD.findOne({
            'MATNR': trovati[i]['articolo'].toString(),
          }).lean();
          if (!trovati[i].hasOwnProperty('tipo')) {
            trovati[i]['tipo'] = 'nuovo';
          }
        }
        return res.json({
          'type': 'success',
          'message': 'Ricerca+Ubicazione finita',
          'risultati': trovati,
        });
      } catch (err) {
        logger.error(JSON.stringify(err.message));
        sendmail('Ricerca dopo inserimento Ubicazione', JSON.stringify(err.message));
        return res.json({
          'type': 'error',
          'message': JSON.stringify(err.message),
        });
      }
    } else {
      return res.json({
        'type': 'warning',
        'message': 'Hai inserito una posizione non adatta!!',
      });
    }
  } else {
    return res.json({
      'type': 'warning',
      'message': 'Hai inserito dati non conformi!',
    });
  }
});


/**
 * oernette di cancellare un ubicazione nel magazzino
 *
 *
 */
router.get('/delete', async function (req, res) {
  const id = req.query.id;

  const utente = req.query.utente;

  if (id) {
    try {
      const user = await USER.findOne({
        'username': utente.toString(),
      });
      const x = await UBICAZIONE.findById(id).lean().exec();
      const movimento = {
        'data': moment().format('DD/MM/YYYY HH:mm:ss'),
        'datapart': moment().format('YYYYMMDD'),
        'codicearticolo': x.articolo,
        'movimento': 'remove',
        'ubicazione': x.armadio + '' + x.ripiano + '' + x.posizione,
        'author': user,
        'magazzino': x.magazzino,
      };


      var y = await UBICAZIONE.findByIdAndDelete(id);

      try {
        const z = await MOVIMENTI.create(movimento);
      } catch (err) {
        logger.error(JSON.stringify(err.message));
        sendmail('Eliminazione Ubicazione', JSON.stringify(err.message));
        return res.json({
          'type': 'error',
          'message': JSON.stringify(err.message),
        });
      }
    } catch (error) {
      logger.error(JSON.stringify(error.message));
      return res.json({
        'type': 'error',
        'message': JSON.stringify(error),
      });
    };
    return res.json({
      'type': 'success',
      'message': y,
    });
  } else {
    return res.json({
      'type': 'error',
      'message': JSON.stringify('err'),
    });
  }
});

/**
 * permette di spostare il contenuto di un ubicazione in un altro punto
 *
 *
 */
router.post('/swap', async function (req, res) {
  let {
    oldubicazione,
    newubicazione,
    utente,
    id,
    magazzino,
  } = req.query || null;

  if (oldubicazione && newubicazione && utente && id) {
    try {
      oldubicazione = oldubicazione.toUpperCase();
      newubicazione = newubicazione.toUpperCase();
      const ubicato = await UBICAZIONE.findById(id).lean();
      if (ubicato) {
        const user = await USER.findOne({
          'username': utente.toString()
        }).lean();

        const armadio = newubicazione[0];
        const ripiano = newubicazione[1];
        const posizione = newubicazione[2] + newubicazione[3] + newubicazione[4];

        const newData = {
          'armadio': armadio,
          'ripiano': ripiano,
          'posizione': posizione,
          'ubicazione': armadio + '' + ripiano + '' + posizione,
          'magazzino': magazzino,
        };
        try {
          var x = await UBICAZIONE.findByIdAndUpdate(ubicato._id, newData);
        } catch (err) {
          logger.error(JSON.stringify(err.message));
          sendmail('Inserimento Ubicazione', JSON.stringify(err.message));
          return res.json({
            'type': 'error',
            'message': JSON.stringify(err.message),
          });
        }
        const movimento = {
          'data': moment().format('DD/MM/YYYY HH:mm:ss'),
          'datapart': moment().format('YYYYMMDD'),
          'codicearticolo': ubicato.articolo.toString(),
          'movimento': 'move to ' + oldubicazione.toString(),
          'ubicazione': armadio.toString() + '' + ripiano.toString() + '' + posizione.toString(),
          'author': user,
          'magazzino': magazzino.toString(),
        };

        try {
          var x = await MOVIMENTI.create(movimento);
        } catch (err) {
          logger.error(JSON.stringify(err.message));
          sendmail('Inserimento Ubicazione', JSON.stringify(err.message));
          return res.json({
            'type': 'error',
            'message': JSON.stringify(err.message),
          });
        }
        return res.json({
          'type': 'success',
          'message': 'ok',
        });
      } else {
        logger.error(JSON.stringify('err'));
        return res.json({
          'type': 'error',
          'message': JSON.stringify(null),
        });
      };
    } catch (error) {
      logger.error(JSON.stringify(error.message));
      return res.json({
        'type': 'error',
        'message': JSON.stringify(error),
      });
    };
  } else {
    return res.json({
      'type': 'error',
      'message': JSON.stringify(null),
    });
  };
});


/**
 * api per recuperare i movimenti di un codice in magazzino
 */

router.get('/cercamovimenti', async function (req, res) {
  try {
    const query = req.query; //
    const mesifa = moment().subtract(180, 'days').format('YYYYMMDD');
    let codice = query['codice'] || null;
    const utente = query['utente'] || null;
    if (codice && utente) {
      codice = codice.toUpperCase().trim();
      const user = await USER.findOne({
        'username': utente.toString(),
      }).lean();
      if (user) {
        const magazzino = user.magazzino;
        const movimenti = await MOVIMENTI.find({
          'codicearticolo': codice.toString(),
          'magazzino': magazzino.toString(),
          // 'datapart':{
          //      $gte: mesifa
          //  }
        }).lean();
        for (let i = 0; i < movimenti.length; i++) {
          movimenti[i]['data'] = moment(movimenti[i]['data'], 'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY');
        }
        return res.json({
          'type': 'success',
          'message': 'ok',
          'risultati': movimenti,
        });
      } else {
        return res.json({
          'type': 'warning',
          'message': JSON.stringify('Utente non trovato nel sistema\!'),
        });
      }
    } else {
      return res.json({
        'type': 'warning',
        'message': JSON.stringify('I dati inviati non sono corretti\!'),
      });
    }
  } catch (error) {
    logger.error(JSON.stringify(error.message));
    return res.json({
      'type': 'error',
      'message': JSON.stringify(error.message),
    });
  }
});


router.post('/deletethisubicazione', async function (req, res) {

  const id = req.query.id || null;
  const username = req.query.username || null;
  if (id && username) {
    const user = await USER.findOne({
      'username': username.toString(),
    });
    const x = await UBICAZIONE.findById(id).lean().exec();
    if (x) {
      const movimento = {
        'data': moment().format('DD/MM/YYYY HH:mm:ss'),
        'datapart': moment().format('YYYYMMDD'),
        'codicearticolo': x.articolo,
        'movimento': 'remove',
        'ubicazione': x.armadio + '' + x.ripiano + '' + x.posizione,
        'author': user,
        'magazzino': x.magazzino,
      };
      const y = await UBICAZIONE.findByIdAndDelete(id);
      try {
        const z = await MOVIMENTI.create(movimento);
        const url = 'http://' + process.env.SERVER + ':' + process.env.SERVER + '/update/';
        const testx = await axios.get(url);
      } catch (err) {
        logger.error(JSON.stringify(err.message));
        sendmail('Eliminazione Ubicazione', JSON.stringify(err.message));
        return res.json({
          'type': 'error',
          'message': JSON.stringify(err.message),
        });
      }
      return res.json({
        'type': 'success',
        'message': JSON.stringify('L\'ubicazione è stata rimossa\!'),
      });
    } else {
      return res.json({
        'type': 'error',
        'message': JSON.stringify('L\'ubicazione non è stata trovata\!'),
      });
    }
  } else {
    return res.json({
      'type': 'warning',
      'message': JSON.stringify('I dati inviati non sono corretti\!'),
    });
  }
});


router.post('/spostathisubicazione', async function (req, res) {
  const id = req.query.id || null;
  const username = req.query.username || null;
  const newubi = req.query.newubi || null;
  if (id && username && newubi) {
    const user = await USER.findOne({
      'username': username.toString(),
    }).lean();
    const oldubicazione = await UBICAZIONE.findById(id).lean();

    const ubicazione = await UBICAZIONE.findByIdAndUpdate(id, {
      $set: {
        'armadio': newubi[0],
        'ripiano': newubi[1],
        'posizione': newubi[2] + '' + newubi[3] + '' + newubi[4],
        'ubicazione': newubi,
      },
    }, {
      new: true,
    }).lean();
    const movimento = {
      'data': moment().format('DD/MM/YYYY HH:mm:ss'),
      'datapart': moment().format('YYYYMMDD'),
      'codicearticolo': oldubicazione.articolo.toString(),
      'movimento': 'move to ' + oldubicazione.ubicazione.toString(),
      'ubicazione': newubi[2].toString() + '' + newubi[3].toString() + '' + newubi[4].toString(),
      'author': user,
      'magazzino': user.magazzino.toString(),
    };
    try {
      const creatomov = await MOVIMENTI.create(movimento);
      const url = 'http://' + process.env.SERVER + ':' + process.env.SERVER + '/update/';
      const testx = await axios.get(url);
    } catch (err) {
      logger.error(JSON.stringify(err.message));
      sendmail('Inserimento Ubicazione', JSON.stringify(err.message));
      return res.json({
        'type': 'error',
        'message': JSON.stringify(err.message),
      });
    }
    return res.json({
      'type': 'success',
      'message': JSON.stringify('L\'ubicazione è stata spostata\!'),
      'data': ubicazione,
    });
  } else {
    return res.json({
      'type': 'warning',
      'message': JSON.stringify('I dati inviati non sono corretti\!'),
    });
  }
});

router.post("/updateqta", async function (req, res) {
  const id = req.body.id || null;
  const userid = req.body.userid || null;
  const qta = req.body.qta || null;
  const um = req.body.um || null;
  if (id && userid && qta) {
    const user = await USER.findById(userid).lean();
    const oldubicazione = await UBICAZIONE.findById(id).lean();
    if (oldubicazione) {
      if (typeof oldubicazione.quantita === 'undefined' || oldubicazione.quantita === null) {
        oldubicazione.quantita = 0;
      }
      const ubicazione = await UBICAZIONE.findByIdAndUpdate(id, {
        $set: {
          quantita: qta,
          um: um,
          dataultimaqta: moment().format("DD/MM/YYYY HH:mm:ss"),
          autoreultimaqta: user.username,
        },
      }, {
        new: true,
      }).lean();
      const movimento = {
        data: moment().format("DD/MM/YYYY HH:mm:ss"),
        datapart: moment().format("YYYYMMDD"),
        codicearticolo: oldubicazione.articolo,
        movimento: "modificata qta da " + oldubicazione.quantita.toString() + " a " + parseInt(qta),
        ubicazione: oldubicazione.ubicazione.toString(),
        magazzino: oldubicazione.magazzino.toString(),
        author: user,
        quantita: parseInt(qta),

      };
      try {
        const creatomov = await MOVIMENTI.create(movimento);
      } catch (err) {
        logger.error(JSON.stringify(err.message));
        sendmail("Aggiornamento QTA Ubicazione", JSON.stringify(err.message));
      }
      return res.json({
        type: "success",
        message: JSON.stringify("La quantità è stata aggiornata!"),
        data: ubicazione,
      });
    } else {
      return res.json({
        type: "error",
        message: JSON.stringify("Ubicazione non trovata"),
      });
    }
  } else {
    return res.json({
      type: "warning",
      message: JSON.stringify("I dati inviati non sono corretti"),
    });
  }
});