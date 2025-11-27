import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dataset completo de las 196 provincias del Perú
// Fuente: INEI - Instituto Nacional de Estadística e Informática
const PROVINCIAS = [
  // AMAZONAS (DEP-01) - 7 provincias
  { departamentoId: 'DEP-01', nombre: 'CHACHAPOYAS', codigo: '0101' },
  { departamentoId: 'DEP-01', nombre: 'BAGUA', codigo: '0102' },
  { departamentoId: 'DEP-01', nombre: 'BONGARÁ', codigo: '0103' },
  { departamentoId: 'DEP-01', nombre: 'CONDORCANQUI', codigo: '0104' },
  { departamentoId: 'DEP-01', nombre: 'LUYA', codigo: '0105' },
  { departamentoId: 'DEP-01', nombre: 'RODRÍGUEZ DE MENDOZA', codigo: '0106' },
  { departamentoId: 'DEP-01', nombre: 'UTCUBAMBA', codigo: '0107' },

  // ÁNCASH (DEP-02) - 20 provincias
  { departamentoId: 'DEP-02', nombre: 'HUARAZ', codigo: '0201' },
  { departamentoId: 'DEP-02', nombre: 'AIJA', codigo: '0202' },
  { departamentoId: 'DEP-02', nombre: 'ANTONIO RAYMONDI', codigo: '0203' },
  { departamentoId: 'DEP-02', nombre: 'ASUNCIÓN', codigo: '0204' },
  { departamentoId: 'DEP-02', nombre: 'BOLOGNESI', codigo: '0205' },
  { departamentoId: 'DEP-02', nombre: 'CARHUAZ', codigo: '0206' },
  { departamentoId: 'DEP-02', nombre: 'CARLOS FERMÍN FITZCARRALD', codigo: '0207' },
  { departamentoId: 'DEP-02', nombre: 'CASMA', codigo: '0208' },
  { departamentoId: 'DEP-02', nombre: 'CORONGO', codigo: '0209' },
  { departamentoId: 'DEP-02', nombre: 'HUARI', codigo: '0210' },
  { departamentoId: 'DEP-02', nombre: 'HUARMEY', codigo: '0211' },
  { departamentoId: 'DEP-02', nombre: 'HUAYLAS', codigo: '0212' },
  { departamentoId: 'DEP-02', nombre: 'MARISCAL LUZURIAGA', codigo: '0213' },
  { departamentoId: 'DEP-02', nombre: 'OCROS', codigo: '0214' },
  { departamentoId: 'DEP-02', nombre: 'PALLASCA', codigo: '0215' },
  { departamentoId: 'DEP-02', nombre: 'POMABAMBA', codigo: '0216' },
  { departamentoId: 'DEP-02', nombre: 'RECUAY', codigo: '0217' },
  { departamentoId: 'DEP-02', nombre: 'SANTA', codigo: '0218' },
  { departamentoId: 'DEP-02', nombre: 'SIHUAS', codigo: '0219' },
  { departamentoId: 'DEP-02', nombre: 'YUNGAY', codigo: '0220' },

  // APURÍMAC (DEP-03) - 7 provincias
  { departamentoId: 'DEP-03', nombre: 'ABANCAY', codigo: '0301' },
  { departamentoId: 'DEP-03', nombre: 'ANDAHUAYLAS', codigo: '0302' },
  { departamentoId: 'DEP-03', nombre: 'ANTABAMBA', codigo: '0303' },
  { departamentoId: 'DEP-03', nombre: 'AYMARAES', codigo: '0304' },
  { departamentoId: 'DEP-03', nombre: 'COTABAMBAS', codigo: '0305' },
  { departamentoId: 'DEP-03', nombre: 'CHINCHEROS', codigo: '0306' },
  { departamentoId: 'DEP-03', nombre: 'GRAU', codigo: '0307' },

  // AREQUIPA (DEP-04) - 8 provincias
  { departamentoId: 'DEP-04', nombre: 'AREQUIPA', codigo: '0401' },
  { departamentoId: 'DEP-04', nombre: 'CAMANÁ', codigo: '0402' },
  { departamentoId: 'DEP-04', nombre: 'CARAVELÍ', codigo: '0403' },
  { departamentoId: 'DEP-04', nombre: 'CASTILLA', codigo: '0404' },
  { departamentoId: 'DEP-04', nombre: 'CAYLLOMA', codigo: '0405' },
  { departamentoId: 'DEP-04', nombre: 'CONDESUYOS', codigo: '0406' },
  { departamentoId: 'DEP-04', nombre: 'ISLAY', codigo: '0407' },
  { departamentoId: 'DEP-04', nombre: 'LA UNIÓN', codigo: '0408' },

  // AYACUCHO (DEP-05) - 11 provincias
  { departamentoId: 'DEP-05', nombre: 'HUAMANGA', codigo: '0501' },
  { departamentoId: 'DEP-05', nombre: 'CANGALLO', codigo: '0502' },
  { departamentoId: 'DEP-05', nombre: 'HUANCA SANCOS', codigo: '0503' },
  { departamentoId: 'DEP-05', nombre: 'HUANTA', codigo: '0504' },
  { departamentoId: 'DEP-05', nombre: 'LA MAR', codigo: '0505' },
  { departamentoId: 'DEP-05', nombre: 'LUCANAS', codigo: '0506' },
  { departamentoId: 'DEP-05', nombre: 'PARINACOCHAS', codigo: '0507' },
  { departamentoId: 'DEP-05', nombre: 'PÁUCAR DEL SARA SARA', codigo: '0508' },
  { departamentoId: 'DEP-05', nombre: 'SUCRE', codigo: '0509' },
  { departamentoId: 'DEP-05', nombre: 'VÍCTOR FAJARDO', codigo: '0510' },
  { departamentoId: 'DEP-05', nombre: 'VILCAS HUAMÁN', codigo: '0511' },

  // CAJAMARCA (DEP-06) - 13 provincias
  { departamentoId: 'DEP-06', nombre: 'CAJAMARCA', codigo: '0601' },
  { departamentoId: 'DEP-06', nombre: 'CAJABAMBA', codigo: '0602' },
  { departamentoId: 'DEP-06', nombre: 'CELENDÍN', codigo: '0603' },
  { departamentoId: 'DEP-06', nombre: 'CHOTA', codigo: '0604' },
  { departamentoId: 'DEP-06', nombre: 'CONTUMAZÁ', codigo: '0605' },
  { departamentoId: 'DEP-06', nombre: 'CUTERVO', codigo: '0606' },
  { departamentoId: 'DEP-06', nombre: 'HUALGAYOC', codigo: '0607' },
  { departamentoId: 'DEP-06', nombre: 'JAÉN', codigo: '0608' },
  { departamentoId: 'DEP-06', nombre: 'SAN IGNACIO', codigo: '0609' },
  { departamentoId: 'DEP-06', nombre: 'SAN MARCOS', codigo: '0610' },
  { departamentoId: 'DEP-06', nombre: 'SAN MIGUEL', codigo: '0611' },
  { departamentoId: 'DEP-06', nombre: 'SAN PABLO', codigo: '0612' },
  { departamentoId: 'DEP-06', nombre: 'SANTA CRUZ', codigo: '0613' },

  // CALLAO (DEP-07) - 1 provincia
  { departamentoId: 'DEP-07', nombre: 'CALLAO', codigo: '0701' },

  // CUSCO (DEP-08) - 13 provincias
  { departamentoId: 'DEP-08', nombre: 'CUSCO', codigo: '0801' },
  { departamentoId: 'DEP-08', nombre: 'ACOMAYO', codigo: '0802' },
  { departamentoId: 'DEP-08', nombre: 'ANTA', codigo: '0803' },
  { departamentoId: 'DEP-08', nombre: 'CALCA', codigo: '0804' },
  { departamentoId: 'DEP-08', nombre: 'CANAS', codigo: '0805' },
  { departamentoId: 'DEP-08', nombre: 'CANCHIS', codigo: '0806' },
  { departamentoId: 'DEP-08', nombre: 'CHUMBIVILCAS', codigo: '0807' },
  { departamentoId: 'DEP-08', nombre: 'ESPINAR', codigo: '0808' },
  { departamentoId: 'DEP-08', nombre: 'LA CONVENCIÓN', codigo: '0809' },
  { departamentoId: 'DEP-08', nombre: 'PARURO', codigo: '0810' },
  { departamentoId: 'DEP-08', nombre: 'PAUCARTAMBO', codigo: '0811' },
  { departamentoId: 'DEP-08', nombre: 'QUISPICANCHI', codigo: '0812' },
  { departamentoId: 'DEP-08', nombre: 'URUBAMBA', codigo: '0813' },

  // HUANCAVELICA (DEP-09) - 7 provincias
  { departamentoId: 'DEP-09', nombre: 'HUANCAVELICA', codigo: '0901' },
  { departamentoId: 'DEP-09', nombre: 'ACOBAMBA', codigo: '0902' },
  { departamentoId: 'DEP-09', nombre: 'ANGARAES', codigo: '0903' },
  { departamentoId: 'DEP-09', nombre: 'CASTROVIRREYNA', codigo: '0904' },
  { departamentoId: 'DEP-09', nombre: 'CHURCAMPA', codigo: '0905' },
  { departamentoId: 'DEP-09', nombre: 'HUAYTARÁ', codigo: '0906' },
  { departamentoId: 'DEP-09', nombre: 'TAYACAJA', codigo: '0907' },

  // HUÁNUCO (DEP-10) - 11 provincias
  { departamentoId: 'DEP-10', nombre: 'HUÁNUCO', codigo: '1001' },
  { departamentoId: 'DEP-10', nombre: 'AMBO', codigo: '1002' },
  { departamentoId: 'DEP-10', nombre: 'DOS DE MAYO', codigo: '1003' },
  { departamentoId: 'DEP-10', nombre: 'HUACAYBAMBA', codigo: '1004' },
  { departamentoId: 'DEP-10', nombre: 'HUAMALÍES', codigo: '1005' },
  { departamentoId: 'DEP-10', nombre: 'LEONCIO PRADO', codigo: '1006' },
  { departamentoId: 'DEP-10', nombre: 'MARAÑÓN', codigo: '1007' },
  { departamentoId: 'DEP-10', nombre: 'PACHITEA', codigo: '1008' },
  { departamentoId: 'DEP-10', nombre: 'PUERTO INCA', codigo: '1009' },
  { departamentoId: 'DEP-10', nombre: 'LAURICOCHA', codigo: '1010' },
  { departamentoId: 'DEP-10', nombre: 'YAROWILCA', codigo: '1011' },

  // ICA (DEP-11) - 5 provincias
  { departamentoId: 'DEP-11', nombre: 'ICA', codigo: '1101' },
  { departamentoId: 'DEP-11', nombre: 'CHINCHA', codigo: '1102' },
  { departamentoId: 'DEP-11', nombre: 'NAZCA', codigo: '1103' },
  { departamentoId: 'DEP-11', nombre: 'PALPA', codigo: '1104' },
  { departamentoId: 'DEP-11', nombre: 'PISCO', codigo: '1105' },

  // JUNÍN (DEP-12) - 9 provincias
  { departamentoId: 'DEP-12', nombre: 'HUANCAYO', codigo: '1201' },
  { departamentoId: 'DEP-12', nombre: 'CONCEPCIÓN', codigo: '1202' },
  { departamentoId: 'DEP-12', nombre: 'CHANCHAMAYO', codigo: '1203' },
  { departamentoId: 'DEP-12', nombre: 'JAUJA', codigo: '1204' },
  { departamentoId: 'DEP-12', nombre: 'JUNÍN', codigo: '1205' },
  { departamentoId: 'DEP-12', nombre: 'SATIPO', codigo: '1206' },
  { departamentoId: 'DEP-12', nombre: 'TARMA', codigo: '1207' },
  { departamentoId: 'DEP-12', nombre: 'YAULI', codigo: '1208' },
  { departamentoId: 'DEP-12', nombre: 'CHUPACA', codigo: '1209' },

  // LA LIBERTAD (DEP-13) - 12 provincias
  { departamentoId: 'DEP-13', nombre: 'TRUJILLO', codigo: '1301' },
  { departamentoId: 'DEP-13', nombre: 'ASCOPE', codigo: '1302' },
  { departamentoId: 'DEP-13', nombre: 'BOLÍVAR', codigo: '1303' },
  { departamentoId: 'DEP-13', nombre: 'CHEPÉN', codigo: '1304' },
  { departamentoId: 'DEP-13', nombre: 'JULCÁN', codigo: '1305' },
  { departamentoId: 'DEP-13', nombre: 'OTUZCO', codigo: '1306' },
  { departamentoId: 'DEP-13', nombre: 'PACASMAYO', codigo: '1307' },
  { departamentoId: 'DEP-13', nombre: 'PATAZ', codigo: '1308' },
  { departamentoId: 'DEP-13', nombre: 'SÁNCHEZ CARRIÓN', codigo: '1309' },
  { departamentoId: 'DEP-13', nombre: 'SANTIAGO DE CHUCO', codigo: '1310' },
  { departamentoId: 'DEP-13', nombre: 'GRAN CHIMÚ', codigo: '1311' },
  { departamentoId: 'DEP-13', nombre: 'VIRÚ', codigo: '1312' },

  // LAMBAYEQUE (DEP-14) - 3 provincias
  { departamentoId: 'DEP-14', nombre: 'CHICLAYO', codigo: '1401' },
  { departamentoId: 'DEP-14', nombre: 'FERREÑAFE', codigo: '1402' },
  { departamentoId: 'DEP-14', nombre: 'LAMBAYEQUE', codigo: '1403' },

  // LIMA (DEP-15) - 10 provincias
  { departamentoId: 'DEP-15', nombre: 'LIMA', codigo: '1501' },
  { departamentoId: 'DEP-15', nombre: 'BARRANCA', codigo: '1502' },
  { departamentoId: 'DEP-15', nombre: 'CAJATAMBO', codigo: '1503' },
  { departamentoId: 'DEP-15', nombre: 'CANTA', codigo: '1504' },
  { departamentoId: 'DEP-15', nombre: 'CAÑETE', codigo: '1505' },
  { departamentoId: 'DEP-15', nombre: 'HUARAL', codigo: '1506' },
  { departamentoId: 'DEP-15', nombre: 'HUAROCHIRÍ', codigo: '1507' },
  { departamentoId: 'DEP-15', nombre: 'HUAURA', codigo: '1508' },
  { departamentoId: 'DEP-15', nombre: 'OYÓN', codigo: '1509' },
  { departamentoId: 'DEP-15', nombre: 'YAUYOS', codigo: '1510' },

  // LORETO (DEP-16) - 8 provincias
  { departamentoId: 'DEP-16', nombre: 'MAYNAS', codigo: '1601' },
  { departamentoId: 'DEP-16', nombre: 'ALTO AMAZONAS', codigo: '1602' },
  { departamentoId: 'DEP-16', nombre: 'LORETO', codigo: '1603' },
  { departamentoId: 'DEP-16', nombre: 'MARISCAL RAMÓN CASTILLA', codigo: '1604' },
  { departamentoId: 'DEP-16', nombre: 'REQUENA', codigo: '1605' },
  { departamentoId: 'DEP-16', nombre: 'UCAYALI', codigo: '1606' },
  { departamentoId: 'DEP-16', nombre: 'DATEM DEL MARAÑÓN', codigo: '1607' },
  { departamentoId: 'DEP-16', nombre: 'PUTUMAYO', codigo: '1608' },

  // MADRE DE DIOS (DEP-17) - 3 provincias
  { departamentoId: 'DEP-17', nombre: 'TAMBOPATA', codigo: '1701' },
  { departamentoId: 'DEP-17', nombre: 'MANU', codigo: '1702' },
  { departamentoId: 'DEP-17', nombre: 'TAHUAMANU', codigo: '1703' },

  // MOQUEGUA (DEP-18) - 3 provincias
  { departamentoId: 'DEP-18', nombre: 'MARISCAL NIETO', codigo: '1801' },
  { departamentoId: 'DEP-18', nombre: 'GENERAL SÁNCHEZ CERRO', codigo: '1802' },
  { departamentoId: 'DEP-18', nombre: 'ILO', codigo: '1803' },

  // PASCO (DEP-19) - 3 provincias
  { departamentoId: 'DEP-19', nombre: 'PASCO', codigo: '1901' },
  { departamentoId: 'DEP-19', nombre: 'DANIEL ALCIDES CARRIÓN', codigo: '1902' },
  { departamentoId: 'DEP-19', nombre: 'OXAPAMPA', codigo: '1903' },

  // PIURA (DEP-20) - 8 provincias
  { departamentoId: 'DEP-20', nombre: 'PIURA', codigo: '2001' },
  { departamentoId: 'DEP-20', nombre: 'AYABACA', codigo: '2002' },
  { departamentoId: 'DEP-20', nombre: 'HUANCABAMBA', codigo: '2003' },
  { departamentoId: 'DEP-20', nombre: 'MORROPÓN', codigo: '2004' },
  { departamentoId: 'DEP-20', nombre: 'PAITA', codigo: '2005' },
  { departamentoId: 'DEP-20', nombre: 'SULLANA', codigo: '2006' },
  { departamentoId: 'DEP-20', nombre: 'TALARA', codigo: '2007' },
  { departamentoId: 'DEP-20', nombre: 'SECHURA', codigo: '2008' },

  // PUNO (DEP-21) - 13 provincias
  { departamentoId: 'DEP-21', nombre: 'PUNO', codigo: '2101' },
  { departamentoId: 'DEP-21', nombre: 'AZÁNGARO', codigo: '2102' },
  { departamentoId: 'DEP-21', nombre: 'CARABAYA', codigo: '2103' },
  { departamentoId: 'DEP-21', nombre: 'CHUCUITO', codigo: '2104' },
  { departamentoId: 'DEP-21', nombre: 'EL COLLAO', codigo: '2105' },
  { departamentoId: 'DEP-21', nombre: 'HUANCANÉ', codigo: '2106' },
  { departamentoId: 'DEP-21', nombre: 'LAMPA', codigo: '2107' },
  { departamentoId: 'DEP-21', nombre: 'MELGAR', codigo: '2108' },
  { departamentoId: 'DEP-21', nombre: 'MOHO', codigo: '2109' },
  { departamentoId: 'DEP-21', nombre: 'SAN ANTONIO DE PUTINA', codigo: '2110' },
  { departamentoId: 'DEP-21', nombre: 'SAN ROMÁN', codigo: '2111' },
  { departamentoId: 'DEP-21', nombre: 'SANDIA', codigo: '2112' },
  { departamentoId: 'DEP-21', nombre: 'YUNGUYO', codigo: '2113' },

  // SAN MARTÍN (DEP-22) - 10 provincias
  { departamentoId: 'DEP-22', nombre: 'MOYOBAMBA', codigo: '2201' },
  { departamentoId: 'DEP-22', nombre: 'BELLAVISTA', codigo: '2202' },
  { departamentoId: 'DEP-22', nombre: 'EL DORADO', codigo: '2203' },
  { departamentoId: 'DEP-22', nombre: 'HUALLAGA', codigo: '2204' },
  { departamentoId: 'DEP-22', nombre: 'LAMAS', codigo: '2205' },
  { departamentoId: 'DEP-22', nombre: 'MARISCAL CÁCERES', codigo: '2206' },
  { departamentoId: 'DEP-22', nombre: 'PICOTA', codigo: '2207' },
  { departamentoId: 'DEP-22', nombre: 'RIOJA', codigo: '2208' },
  { departamentoId: 'DEP-22', nombre: 'SAN MARTÍN', codigo: '2209' },
  { departamentoId: 'DEP-22', nombre: 'TOCACHE', codigo: '2210' },

  // TACNA (DEP-23) - 4 provincias
  { departamentoId: 'DEP-23', nombre: 'TACNA', codigo: '2301' },
  { departamentoId: 'DEP-23', nombre: 'CANDARAVE', codigo: '2302' },
  { departamentoId: 'DEP-23', nombre: 'JORGE BASADRE', codigo: '2303' },
  { departamentoId: 'DEP-23', nombre: 'TARATA', codigo: '2304' },

  // TUMBES (DEP-24) - 3 provincias
  { departamentoId: 'DEP-24', nombre: 'TUMBES', codigo: '2401' },
  { departamentoId: 'DEP-24', nombre: 'CONTRALMIRANTE VILLAR', codigo: '2402' },
  { departamentoId: 'DEP-24', nombre: 'ZARUMILLA', codigo: '2403' },

  // UCAYALI (DEP-25) - 4 provincias
  { departamentoId: 'DEP-25', nombre: 'CORONEL PORTILLO', codigo: '2501' },
  { departamentoId: 'DEP-25', nombre: 'ATALAYA', codigo: '2502' },
  { departamentoId: 'DEP-25', nombre: 'PADRE ABAD', codigo: '2503' },
  { departamentoId: 'DEP-25', nombre: 'PURÚS', codigo: '2504' },
];

async function main() {
  console.log('🌎 Cargando dataset completo de provincias del Perú...\n');

  let provinciasCreadas = 0;
  let provinciasActualizadas = 0;
  let errores = 0;

  for (const provincia of PROVINCIAS) {
    try {
      // Verificar si el departamento existe
      const departamento = await prisma.departamento.findUnique({
        where: { id: provincia.departamentoId },
      });

      if (!departamento) {
        console.log(`❌ Departamento no encontrado: ${provincia.departamentoId} para provincia ${provincia.nombre}`);
        errores++;
        continue;
      }

      // Intentar crear o actualizar provincia
      const id = `PRO-${provincia.codigo}`;
      const existing = await prisma.provincia.findUnique({ where: { id } });

      if (existing) {
        // Actualizar si ya existe
        await prisma.provincia.update({
          where: { id },
          data: {
            nombre: provincia.nombre,
            departamentoId: provincia.departamentoId,
          },
        });
        provinciasActualizadas++;
      } else {
        // Crear nueva
        await prisma.provincia.create({
          data: {
            id,
            nombre: provincia.nombre,
            departamentoId: provincia.departamentoId,
          },
        });
        provinciasCreadas++;
      }
    } catch (error) {
      console.error(`❌ Error procesando provincia ${provincia.nombre}:`, error);
      errores++;
    }
  }

  console.log('\n📊 Resumen de carga:');
  console.log(`   ✅ Provincias creadas: ${provinciasCreadas}`);
  console.log(`   🔄 Provincias actualizadas: ${provinciasActualizadas}`);
  console.log(`   ❌ Errores: ${errores}`);

  // Verificar totales
  const totales = await prisma.provincia.count();
  console.log(`\n📈 Total de provincias en BD: ${totales}/196`);

  // Mostrar provincias por departamento
  console.log('\n📋 Provincias por departamento:');
  const departamentos = await prisma.departamento.findMany({
    orderBy: { nombre: 'asc' },
    include: {
      _count: {
        select: { provincias: true },
      },
    },
  });

  for (const dep of departamentos) {
    if (dep._count.provincias > 0) {
      console.log(`   ${dep.nombre}: ${dep._count.provincias} provincias`);
    }
  }

  console.log('\n✅ Carga de provincias completada!');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
