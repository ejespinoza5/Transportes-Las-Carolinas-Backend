import XLSX from "xlsx";
import { PaqueteService } from "../services/paquete.service.js";

export const PaqueteController = {
    getAll: async (req, res) => {
        const paquetes = await PaqueteService.getAll();
        res.json(paquetes);
    },

    getAllPaginated: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const id_grupo = req.query.id_grupo ? parseInt(req.query.id_grupo) : null;

            const result = await PaqueteService.getAllPaginated(page, limit, id_grupo);
            res.json(result);
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: "Error al obtener paquetes paginados",
                detalle: error.message
            });
        }
    },  getByGuia: async (req, res) => {
    try {
      const paquete = await PaqueteService.getByGuia(req.params.guia);

      if (!paquete) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró ningún paquete activo con ese número de guía",
          guia_buscada: req.params.guia
        });
      }

      res.json(paquete);
    } catch (error) {
      res.status(500).json({
        ok: false,
        message: "Error al buscar el paquete",
        detalle: error.message
      });
    }
  },

  getById: async (req, res) => {
    const paquete = await PaqueteService.getById(req.params.id);

    if (!paquete) {
      return res.status(404).json({ message: "Paquete no encontrado" });
    }

    res.json(paquete);
  },

  create: async (req, res) => {
    try {
      const id = await PaqueteService.create(req.body);

      res.status(201).json({
        ok: true,
        message: "Paquete creado correctamente",
        id: id
      });

    } catch (error) {
      res.status(error.status || 500).json({
        ok: false,
        message: error.message || "Error desconocido",
        detalle: error.detalle || null
      });
    }
  },

  update: async (req, res) => {
    try {
      const result = await PaqueteService.update(req.params.id, req.body);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Paquete no encontrado o sin cambios" });
      }

      res.json({ message: "Paquete actualizado correctamente" });
    } catch (error) {
      res.status(error.status || 500).json({
        ok: false,
        message: error.message || "Error desconocido",
        detalle: error.detalle || null
      });
    }
  },
  updateEstado: async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;

      // Validación básica
      if (!data.id_estado || !data.fecha_cambio || !data.hora_cambio) {
        return res.status(400).json({
          ok: false,
          message: "id_estado, fecha_cambio y hora_cambio son obligatorios"
        });
      }

      const respuesta = await PaqueteService.updateEstado(id, data);

      res.json(respuesta);

    } catch (error) {
      res.status(error.status || 500).json({
        ok: false,
        message: error.message,
        detalle: error.detalle || null
      });
    }
  },

  // Actualizar estado de múltiples paquetes
  updateEstadoMultiple: async (req, res) => {
    try {
      const { ids, ...data } = req.body;

      // Validación básica
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          ok: false,
          message: "Debe proporcionar un array de IDs en el campo 'ids'"
        });
      }

      if (!data.id_estado || !data.fecha_cambio || !data.hora_cambio) {
        return res.status(400).json({
          ok: false,
          message: "id_estado, fecha_cambio y hora_cambio son obligatorios"
        });
      }

      const respuesta = await PaqueteService.updateEstadoMultiple(ids, data);

      res.json(respuesta);

    } catch (error) {
      res.status(error.status || 500).json({
        ok: false,
        message: error.message,
        detalle: error.detalle || null
      });
    }
  },

   getByGuiaFull: async (req, res) => {
    try {
      const { guia } = req.params;
      const result = await PaqueteService.getByGuiaFull(guia);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || "Error interno del servidor"
      });
    }
  },

  deactivate: async (req, res) => {
    await PaqueteService.deactivate(req.params.id);
    res.json({ message: "Paquete marcado como inactivo" });
  },

  deactivateMultiple: async (req, res) => {
    try {
      const { ids } = req.body;

      // Validación básica
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          ok: false,
          message: "Debe proporcionar un array de IDs en el campo 'ids'"
        });
      }

      const respuesta = await PaqueteService.deactivateMultiple(ids);

      res.json(respuesta);

    } catch (error) {
      res.status(error.status || 500).json({
        ok: false,
        message: error.message,
        detalle: error.detalle || null
      });
    }
  },
};

//importar excel
export const importarPaquetes = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Debes subir un archivo Excel." });
    }

    // Extraer id_grupo e id_estado del body (opcionales)
    const id_grupo = req.body.id_grupo ? parseInt(req.body.id_grupo) : null;
    const id_estado = req.body.id_estado ? parseInt(req.body.id_estado) : null;

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    // Normalizar encabezados automáticamente
    const dataRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: null,
      raw: true
    });

    // Quitar espacios y uniformar nombres de columnas
    const data = dataRaw.map(row => {
      const limpio = {};
      for (const key in row) {
        const keyLimpio = key.trim(); // <-- ¡AQUÍ ESTÁ LA SOLUCIÓN!
        limpio[keyLimpio] = row[key];
      }
      return limpio;
    });

    const resultados = [];
    let insertados = 0;
    let actualizados = 0;
    let errores = 0;


    for (const row of data) {
      try {
        const paquete = {
          Servicio: row["SERVICIO"],
          Guia: String(row["GUIA"]).trim(),
          Fecha_Salida: formatearFecha(row["Fecha salida"]),
          Remitente: row["Remitente"],
          Peso_LB: row["PESO LB"],
          Courier: row["Courier"],
          guia_tramaco: null,
          id_grupo: id_grupo, // Agregar el id_grupo a cada paquete
          id_estado: id_estado // Agregar el id_estado a cada paquete
        };

        const resultado = await PaqueteService.upsert(paquete);

        if (resultado.action === 'created') {
          insertados++;
        } else if (resultado.action === 'updated') {
          actualizados++;
        }
      } catch (error) {
        errores++;
        console.error('Error importando paquete:', error);
      }
    }

    return res.json({
      message: "Importación finalizada",
      insertados,
      actualizados,
      errores,
      total: data.length
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error procesando el archivo",
      detalle: error.toString()
    });
  }
};


function formatearFecha(valor) {
  if (!valor) return null;

  // Caso: numero Excel
  if (typeof valor === "number") {
    const fecha = new Date((valor - 25569) * 86400 * 1000);
    return fecha.toISOString().split("T")[0];
  }

  // Caso: ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  // Caso: dd/mm/yyyy o dd-mm-yyyy
  if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(valor)) {
    const partes = valor.includes("/") ? valor.split("/") : valor.split("-");
    const [dia, mes, anio] = partes.map(n => parseInt(n));
    return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  }

  return null;
}
