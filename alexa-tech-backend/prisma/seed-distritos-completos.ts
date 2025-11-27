import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dataset de distritos principales del Perú
// Incluye: capitales de provincia + distritos importantes de Lima
const DISTRITOS = [
  // AMAZONAS - Capitales de provincia
  { provinciaId: 'PRO-0101', nombre: 'CHACHAPOYAS', codigo: '010101' },
  { provinciaId: 'PRO-0102', nombre: 'BAGUA', codigo: '010201' },
  { provinciaId: 'PRO-0103', nombre: 'JUMBILLA', codigo: '010301' },
  { provinciaId: 'PRO-0104', nombre: 'NIEVA', codigo: '010401' },
  { provinciaId: 'PRO-0105', nombre: 'LAMUD', codigo: '010501' },
  { provinciaId: 'PRO-0106', nombre: 'SAN NICOLÁS', codigo: '010601' },
  { provinciaId: 'PRO-0107', nombre: 'BAGUA GRANDE', codigo: '010701' },

  // ÁNCASH - Capitales principales
  { provinciaId: 'PRO-0201', nombre: 'HUARAZ', codigo: '020101' },
  { provinciaId: 'PRO-0202', nombre: 'AIJA', codigo: '020201' },
  { provinciaId: 'PRO-0203', nombre: 'LLAMELLIN', codigo: '020301' },
  { provinciaId: 'PRO-0204', nombre: 'CHACAS', codigo: '020401' },
  { provinciaId: 'PRO-0205', nombre: 'CHIQUIÁN', codigo: '020501' },
  { provinciaId: 'PRO-0206', nombre: 'CARHUAZ', codigo: '020601' },
  { provinciaId: 'PRO-0207', nombre: 'SAN LUIS', codigo: '020701' },
  { provinciaId: 'PRO-0208', nombre: 'CASMA', codigo: '020801' },
  { provinciaId: 'PRO-0209', nombre: 'CORONGO', codigo: '020901' },
  { provinciaId: 'PRO-0210', nombre: 'HUARI', codigo: '021001' },
  { provinciaId: 'PRO-0211', nombre: 'HUARMEY', codigo: '021101' },
  { provinciaId: 'PRO-0212', nombre: 'CARAZ', codigo: '021201' },
  { provinciaId: 'PRO-0213', nombre: 'PISCOBAMBA', codigo: '021301' },
  { provinciaId: 'PRO-0214', nombre: 'OCROS', codigo: '021401' },
  { provinciaId: 'PRO-0215', nombre: 'CABANA', codigo: '021501' },
  { provinciaId: 'PRO-0216', nombre: 'POMABAMBA', codigo: '021601' },
  { provinciaId: 'PRO-0217', nombre: 'RECUAY', codigo: '021701' },
  { provinciaId: 'PRO-0218', nombre: 'CHIMBOTE', codigo: '021801' },
  { provinciaId: 'PRO-0219', nombre: 'SIHUAS', codigo: '021901' },
  { provinciaId: 'PRO-0220', nombre: 'YUNGAY', codigo: '022001' },

  // APURÍMAC - Capitales
  { provinciaId: 'PRO-0301', nombre: 'ABANCAY', codigo: '030101' },
  { provinciaId: 'PRO-0302', nombre: 'ANDAHUAYLAS', codigo: '030201' },
  { provinciaId: 'PRO-0303', nombre: 'ANTABAMBA', codigo: '030301' },
  { provinciaId: 'PRO-0304', nombre: 'CHALHUANCA', codigo: '030401' },
  { provinciaId: 'PRO-0305', nombre: 'TAMBOBAMBA', codigo: '030501' },
  { provinciaId: 'PRO-0306', nombre: 'CHINCHEROS', codigo: '030601' },
  { provinciaId: 'PRO-0307', nombre: 'CHUQUIBAMBILLA', codigo: '030701' },

  // AREQUIPA - Capitales
  { provinciaId: 'PRO-0401', nombre: 'AREQUIPA', codigo: '040101' },
  { provinciaId: 'PRO-0402', nombre: 'CAMANÁ', codigo: '040201' },
  { provinciaId: 'PRO-0403', nombre: 'CARAVELÍ', codigo: '040301' },
  { provinciaId: 'PRO-0404', nombre: 'APLAO', codigo: '040401' },
  { provinciaId: 'PRO-0405', nombre: 'CHIVAY', codigo: '040501' },
  { provinciaId: 'PRO-0406', nombre: 'CHUQUIBAMBA', codigo: '040601' },
  { provinciaId: 'PRO-0407', nombre: 'MOLLENDO', codigo: '040701' },
  { provinciaId: 'PRO-0408', nombre: 'COTAHUASI', codigo: '040801' },

  // AYACUCHO - Capitales
  { provinciaId: 'PRO-0501', nombre: 'AYACUCHO', codigo: '050101' },
  { provinciaId: 'PRO-0502', nombre: 'CANGALLO', codigo: '050201' },
  { provinciaId: 'PRO-0503', nombre: 'SANCOS', codigo: '050301' },
  { provinciaId: 'PRO-0504', nombre: 'HUANTA', codigo: '050401' },
  { provinciaId: 'PRO-0505', nombre: 'SAN MIGUEL', codigo: '050501' },
  { provinciaId: 'PRO-0506', nombre: 'PUQUIO', codigo: '050601' },
  { provinciaId: 'PRO-0507', nombre: 'CORACORA', codigo: '050701' },
  { provinciaId: 'PRO-0508', nombre: 'PAUSA', codigo: '050801' },
  { provinciaId: 'PRO-0509', nombre: 'QUEROBAMBA', codigo: '050901' },
  { provinciaId: 'PRO-0510', nombre: 'HUANCAPI', codigo: '051001' },
  { provinciaId: 'PRO-0511', nombre: 'VILCAS HUAMÁN', codigo: '051101' },

  // CAJAMARCA - Capitales
  { provinciaId: 'PRO-0601', nombre: 'CAJAMARCA', codigo: '060101' },
  { provinciaId: 'PRO-0602', nombre: 'CAJABAMBA', codigo: '060201' },
  { provinciaId: 'PRO-0603', nombre: 'CELENDÍN', codigo: '060301' },
  { provinciaId: 'PRO-0604', nombre: 'CHOTA', codigo: '060401' },
  { provinciaId: 'PRO-0605', nombre: 'CONTUMAZÁ', codigo: '060501' },
  { provinciaId: 'PRO-0606', nombre: 'CUTERVO', codigo: '060601' },
  { provinciaId: 'PRO-0607', nombre: 'BAMBAMARCA', codigo: '060701' },
  { provinciaId: 'PRO-0608', nombre: 'JAÉN', codigo: '060801' },
  { provinciaId: 'PRO-0609', nombre: 'SAN IGNACIO', codigo: '060901' },
  { provinciaId: 'PRO-0610', nombre: 'PEDRO GÁLVEZ', codigo: '061001' },
  { provinciaId: 'PRO-0611', nombre: 'SAN MIGUEL', codigo: '061101' },
  { provinciaId: 'PRO-0612', nombre: 'SAN PABLO', codigo: '061201' },
  { provinciaId: 'PRO-0613', nombre: 'SANTA CRUZ', codigo: '061301' },

  // CALLAO
  { provinciaId: 'PRO-0701', nombre: 'CALLAO', codigo: '070101' },
  { provinciaId: 'PRO-0701', nombre: 'BELLAVISTA', codigo: '070102' },
  { provinciaId: 'PRO-0701', nombre: 'CARMEN DE LA LEGUA REYNOSO', codigo: '070103' },
  { provinciaId: 'PRO-0701', nombre: 'LA PERLA', codigo: '070104' },
  { provinciaId: 'PRO-0701', nombre: 'LA PUNTA', codigo: '070105' },
  { provinciaId: 'PRO-0701', nombre: 'VENTANILLA', codigo: '070106' },

  // CUSCO - Capitales
  { provinciaId: 'PRO-0801', nombre: 'CUSCO', codigo: '080101' },
  { provinciaId: 'PRO-0802', nombre: 'ACOMAYO', codigo: '080201' },
  { provinciaId: 'PRO-0803', nombre: 'ANTA', codigo: '080301' },
  { provinciaId: 'PRO-0804', nombre: 'CALCA', codigo: '080401' },
  { provinciaId: 'PRO-0805', nombre: 'YANAOCA', codigo: '080501' },
  { provinciaId: 'PRO-0806', nombre: 'SICUANI', codigo: '080601' },
  { provinciaId: 'PRO-0807', nombre: 'SANTO TOMÁS', codigo: '080701' },
  { provinciaId: 'PRO-0808', nombre: 'YAURI', codigo: '080801' },
  { provinciaId: 'PRO-0809', nombre: 'SANTA ANA', codigo: '080901' },
  { provinciaId: 'PRO-0810', nombre: 'PARURO', codigo: '081001' },
  { provinciaId: 'PRO-0811', nombre: 'PAUCARTAMBO', codigo: '081101' },
  { provinciaId: 'PRO-0812', nombre: 'URCOS', codigo: '081201' },
  { provinciaId: 'PRO-0813', nombre: 'URUBAMBA', codigo: '081301' },

  // HUANCAVELICA - Capitales
  { provinciaId: 'PRO-0901', nombre: 'HUANCAVELICA', codigo: '090101' },
  { provinciaId: 'PRO-0902', nombre: 'ACOBAMBA', codigo: '090201' },
  { provinciaId: 'PRO-0903', nombre: 'LIRCAY', codigo: '090301' },
  { provinciaId: 'PRO-0904', nombre: 'CASTROVIRREYNA', codigo: '090401' },
  { provinciaId: 'PRO-0905', nombre: 'CHURCAMPA', codigo: '090501' },
  { provinciaId: 'PRO-0906', nombre: 'HUAYTARÁ', codigo: '090601' },
  { provinciaId: 'PRO-0907', nombre: 'PAMPAS', codigo: '090701' },

  // HUÁNUCO - Capitales
  { provinciaId: 'PRO-1001', nombre: 'HUÁNUCO', codigo: '100101' },
  { provinciaId: 'PRO-1002', nombre: 'AMBO', codigo: '100201' },
  { provinciaId: 'PRO-1003', nombre: 'LA UNIÓN', codigo: '100301' },
  { provinciaId: 'PRO-1004', nombre: 'HUACAYBAMBA', codigo: '100401' },
  { provinciaId: 'PRO-1005', nombre: 'LLATA', codigo: '100501' },
  { provinciaId: 'PRO-1006', nombre: 'RUPA-RUPA', codigo: '100601' },
  { provinciaId: 'PRO-1007', nombre: 'HUACRACHUCO', codigo: '100701' },
  { provinciaId: 'PRO-1008', nombre: 'PANAO', codigo: '100801' },
  { provinciaId: 'PRO-1009', nombre: 'PUERTO INCA', codigo: '100901' },
  { provinciaId: 'PRO-1010', nombre: 'JESÚS', codigo: '101001' },
  { provinciaId: 'PRO-1011', nombre: 'CHAVINILLO', codigo: '101101' },

  // ICA - Capitales
  { provinciaId: 'PRO-1101', nombre: 'ICA', codigo: '110101' },
  { provinciaId: 'PRO-1102', nombre: 'CHINCHA ALTA', codigo: '110201' },
  { provinciaId: 'PRO-1103', nombre: 'NAZCA', codigo: '110301' },
  { provinciaId: 'PRO-1104', nombre: 'PALPA', codigo: '110401' },
  { provinciaId: 'PRO-1105', nombre: 'PISCO', codigo: '110501' },

  // JUNÍN - Capitales
  { provinciaId: 'PRO-1201', nombre: 'HUANCAYO', codigo: '120101' },
  { provinciaId: 'PRO-1202', nombre: 'CONCEPCIÓN', codigo: '120201' },
  { provinciaId: 'PRO-1203', nombre: 'CHANCHAMAYO', codigo: '120301' },
  { provinciaId: 'PRO-1204', nombre: 'JAUJA', codigo: '120401' },
  { provinciaId: 'PRO-1205', nombre: 'JUNÍN', codigo: '120501' },
  { provinciaId: 'PRO-1206', nombre: 'SATIPO', codigo: '120601' },
  { provinciaId: 'PRO-1207', nombre: 'TARMA', codigo: '120701' },
  { provinciaId: 'PRO-1208', nombre: 'LA OROYA', codigo: '120801' },
  { provinciaId: 'PRO-1209', nombre: 'CHUPACA', codigo: '120901' },

  // LA LIBERTAD - Capitales
  { provinciaId: 'PRO-1301', nombre: 'TRUJILLO', codigo: '130101' },
  { provinciaId: 'PRO-1302', nombre: 'ASCOPE', codigo: '130201' },
  { provinciaId: 'PRO-1303', nombre: 'BOLÍVAR', codigo: '130301' },
  { provinciaId: 'PRO-1304', nombre: 'CHEPÉN', codigo: '130401' },
  { provinciaId: 'PRO-1305', nombre: 'JULCÁN', codigo: '130501' },
  { provinciaId: 'PRO-1306', nombre: 'OTUZCO', codigo: '130601' },
  { provinciaId: 'PRO-1307', nombre: 'SAN PEDRO DE LLOC', codigo: '130701' },
  { provinciaId: 'PRO-1308', nombre: 'TAYABAMBA', codigo: '130801' },
  { provinciaId: 'PRO-1309', nombre: 'HUAMACHUCO', codigo: '130901' },
  { provinciaId: 'PRO-1310', nombre: 'SANTIAGO DE CHUCO', codigo: '131001' },
  { provinciaId: 'PRO-1311', nombre: 'CASCAS', codigo: '131101' },
  { provinciaId: 'PRO-1312', nombre: 'VIRÚ', codigo: '131201' },

  // LAMBAYEQUE - Capitales
  { provinciaId: 'PRO-1401', nombre: 'CHICLAYO', codigo: '140101' },
  { provinciaId: 'PRO-1402', nombre: 'FERREÑAFE', codigo: '140201' },
  { provinciaId: 'PRO-1403', nombre: 'LAMBAYEQUE', codigo: '140301' },

  // LIMA - Provincia LIMA (43 distritos)
  { provinciaId: 'PRO-1501', nombre: 'LIMA', codigo: '150101' },
  { provinciaId: 'PRO-1501', nombre: 'ANCÓN', codigo: '150102' },
  { provinciaId: 'PRO-1501', nombre: 'ATE', codigo: '150103' },
  { provinciaId: 'PRO-1501', nombre: 'BARRANCO', codigo: '150104' },
  { provinciaId: 'PRO-1501', nombre: 'BREÑA', codigo: '150105' },
  { provinciaId: 'PRO-1501', nombre: 'CARABAYLLO', codigo: '150106' },
  { provinciaId: 'PRO-1501', nombre: 'CHACLACAYO', codigo: '150107' },
  { provinciaId: 'PRO-1501', nombre: 'CHORRILLOS', codigo: '150108' },
  { provinciaId: 'PRO-1501', nombre: 'CIENEGUILLA', codigo: '150109' },
  { provinciaId: 'PRO-1501', nombre: 'COMAS', codigo: '150110' },
  { provinciaId: 'PRO-1501', nombre: 'EL AGUSTINO', codigo: '150111' },
  { provinciaId: 'PRO-1501', nombre: 'INDEPENDENCIA', codigo: '150112' },
  { provinciaId: 'PRO-1501', nombre: 'JESÚS MARÍA', codigo: '150113' },
  { provinciaId: 'PRO-1501', nombre: 'LA MOLINA', codigo: '150114' },
  { provinciaId: 'PRO-1501', nombre: 'LA VICTORIA', codigo: '150115' },
  { provinciaId: 'PRO-1501', nombre: 'LINCE', codigo: '150116' },
  { provinciaId: 'PRO-1501', nombre: 'LOS OLIVOS', codigo: '150117' },
  { provinciaId: 'PRO-1501', nombre: 'LURIGANCHO', codigo: '150118' },
  { provinciaId: 'PRO-1501', nombre: 'LURÍN', codigo: '150119' },
  { provinciaId: 'PRO-1501', nombre: 'MAGDALENA DEL MAR', codigo: '150120' },
  { provinciaId: 'PRO-1501', nombre: 'PUEBLO LIBRE', codigo: '150121' },
  { provinciaId: 'PRO-1501', nombre: 'MIRAFLORES', codigo: '150122' },
  { provinciaId: 'PRO-1501', nombre: 'PACHACAMAC', codigo: '150123' },
  { provinciaId: 'PRO-1501', nombre: 'PUCUSANA', codigo: '150124' },
  { provinciaId: 'PRO-1501', nombre: 'PUENTE PIEDRA', codigo: '150125' },
  { provinciaId: 'PRO-1501', nombre: 'PUNTA HERMOSA', codigo: '150126' },
  { provinciaId: 'PRO-1501', nombre: 'PUNTA NEGRA', codigo: '150127' },
  { provinciaId: 'PRO-1501', nombre: 'RÍMAC', codigo: '150128' },
  { provinciaId: 'PRO-1501', nombre: 'SAN BARTOLO', codigo: '150129' },
  { provinciaId: 'PRO-1501', nombre: 'SAN BORJA', codigo: '150130' },
  { provinciaId: 'PRO-1501', nombre: 'SAN ISIDRO', codigo: '150131' },
  { provinciaId: 'PRO-1501', nombre: 'SAN JUAN DE LURIGANCHO', codigo: '150132' },
  { provinciaId: 'PRO-1501', nombre: 'SAN JUAN DE MIRAFLORES', codigo: '150133' },
  { provinciaId: 'PRO-1501', nombre: 'SAN LUIS', codigo: '150134' },
  { provinciaId: 'PRO-1501', nombre: 'SAN MARTÍN DE PORRES', codigo: '150135' },
  { provinciaId: 'PRO-1501', nombre: 'SAN MIGUEL', codigo: '150136' },
  { provinciaId: 'PRO-1501', nombre: 'SANTA ANITA', codigo: '150137' },
  { provinciaId: 'PRO-1501', nombre: 'SANTA MARÍA DEL MAR', codigo: '150138' },
  { provinciaId: 'PRO-1501', nombre: 'SANTA ROSA', codigo: '150139' },
  { provinciaId: 'PRO-1501', nombre: 'SANTIAGO DE SURCO', codigo: '150140' },
  { provinciaId: 'PRO-1501', nombre: 'SURQUILLO', codigo: '150141' },
  { provinciaId: 'PRO-1501', nombre: 'VILLA EL SALVADOR', codigo: '150142' },
  { provinciaId: 'PRO-1501', nombre: 'VILLA MARÍA DEL TRIUNFO', codigo: '150143' },

  // LIMA - Otras provincias (capitales)
  { provinciaId: 'PRO-1502', nombre: 'BARRANCA', codigo: '150201' },
  { provinciaId: 'PRO-1503', nombre: 'CAJATAMBO', codigo: '150301' },
  { provinciaId: 'PRO-1504', nombre: 'CANTA', codigo: '150401' },
  { provinciaId: 'PRO-1505', nombre: 'SAN VICENTE DE CAÑETE', codigo: '150501' },
  { provinciaId: 'PRO-1506', nombre: 'HUARAL', codigo: '150601' },
  { provinciaId: 'PRO-1507', nombre: 'MATUCANA', codigo: '150701' },
  { provinciaId: 'PRO-1508', nombre: 'HUACHO', codigo: '150801' },
  { provinciaId: 'PRO-1509', nombre: 'OYÓN', codigo: '150901' },
  { provinciaId: 'PRO-1510', nombre: 'YAUYOS', codigo: '151001' },

  // LORETO - Capitales
  { provinciaId: 'PRO-1601', nombre: 'IQUITOS', codigo: '160101' },
  { provinciaId: 'PRO-1602', nombre: 'YURIMAGUAS', codigo: '160201' },
  { provinciaId: 'PRO-1603', nombre: 'NAUTA', codigo: '160301' },
  { provinciaId: 'PRO-1604', nombre: 'RAMÓN CASTILLA', codigo: '160401' },
  { provinciaId: 'PRO-1605', nombre: 'REQUENA', codigo: '160501' },
  { provinciaId: 'PRO-1606', nombre: 'CONTAMANA', codigo: '160601' },
  { provinciaId: 'PRO-1607', nombre: 'SAN LORENZO', codigo: '160701' },
  { provinciaId: 'PRO-1608', nombre: 'SAN ANTONIO DEL ESTRECHO', codigo: '160801' },

  // MADRE DE DIOS - Capitales
  { provinciaId: 'PRO-1701', nombre: 'TAMBOPATA', codigo: '170101' },
  { provinciaId: 'PRO-1702', nombre: 'MANU', codigo: '170201' },
  { provinciaId: 'PRO-1703', nombre: 'IÑAPARI', codigo: '170301' },

  // MOQUEGUA - Capitales
  { provinciaId: 'PRO-1801', nombre: 'MOQUEGUA', codigo: '180101' },
  { provinciaId: 'PRO-1802', nombre: 'OMATE', codigo: '180201' },
  { provinciaId: 'PRO-1803', nombre: 'ILO', codigo: '180301' },

  // PASCO - Capitales
  { provinciaId: 'PRO-1901', nombre: 'CHAUPIMARCA', codigo: '190101' },
  { provinciaId: 'PRO-1902', nombre: 'YANAHUANCA', codigo: '190201' },
  { provinciaId: 'PRO-1903', nombre: 'OXAPAMPA', codigo: '190301' },

  // PIURA - Capitales
  { provinciaId: 'PRO-2001', nombre: 'PIURA', codigo: '200101' },
  { provinciaId: 'PRO-2002', nombre: 'AYABACA', codigo: '200201' },
  { provinciaId: 'PRO-2003', nombre: 'HUANCABAMBA', codigo: '200301' },
  { provinciaId: 'PRO-2004', nombre: 'CHULUCANAS', codigo: '200401' },
  { provinciaId: 'PRO-2005', nombre: 'PAITA', codigo: '200501' },
  { provinciaId: 'PRO-2006', nombre: 'SULLANA', codigo: '200601' },
  { provinciaId: 'PRO-2007', nombre: 'PARIÑAS', codigo: '200701' },
  { provinciaId: 'PRO-2008', nombre: 'SECHURA', codigo: '200801' },

  // PUNO - Capitales
  { provinciaId: 'PRO-2101', nombre: 'PUNO', codigo: '210101' },
  { provinciaId: 'PRO-2102', nombre: 'AZÁNGARO', codigo: '210201' },
  { provinciaId: 'PRO-2103', nombre: 'MACUSANI', codigo: '210301' },
  { provinciaId: 'PRO-2104', nombre: 'JULI', codigo: '210401' },
  { provinciaId: 'PRO-2105', nombre: 'ILAVE', codigo: '210501' },
  { provinciaId: 'PRO-2106', nombre: 'HUANCANÉ', codigo: '210601' },
  { provinciaId: 'PRO-2107', nombre: 'LAMPA', codigo: '210701' },
  { provinciaId: 'PRO-2108', nombre: 'AYAVIRI', codigo: '210801' },
  { provinciaId: 'PRO-2109', nombre: 'MOHO', codigo: '210901' },
  { provinciaId: 'PRO-2110', nombre: 'PUTINA', codigo: '211001' },
  { provinciaId: 'PRO-2111', nombre: 'JULIACA', codigo: '211101' },
  { provinciaId: 'PRO-2112', nombre: 'SANDIA', codigo: '211201' },
  { provinciaId: 'PRO-2113', nombre: 'YUNGUYO', codigo: '211301' },

  // SAN MARTÍN - Capitales
  { provinciaId: 'PRO-2201', nombre: 'MOYOBAMBA', codigo: '220101' },
  { provinciaId: 'PRO-2202', nombre: 'BELLAVISTA', codigo: '220201' },
  { provinciaId: 'PRO-2203', nombre: 'SAN JOSÉ DE SISA', codigo: '220301' },
  { provinciaId: 'PRO-2204', nombre: 'SAPOSOA', codigo: '220401' },
  { provinciaId: 'PRO-2205', nombre: 'LAMAS', codigo: '220501' },
  { provinciaId: 'PRO-2206', nombre: 'JUANJUÍ', codigo: '220601' },
  { provinciaId: 'PRO-2207', nombre: 'PICOTA', codigo: '220701' },
  { provinciaId: 'PRO-2208', nombre: 'RIOJA', codigo: '220801' },
  { provinciaId: 'PRO-2209', nombre: 'TARAPOTO', codigo: '220901' },
  { provinciaId: 'PRO-2210', nombre: 'TOCACHE', codigo: '221001' },

  // TACNA - Capitales
  { provinciaId: 'PRO-2301', nombre: 'TACNA', codigo: '230101' },
  { provinciaId: 'PRO-2302', nombre: 'CANDARAVE', codigo: '230201' },
  { provinciaId: 'PRO-2303', nombre: 'LOCUMBA', codigo: '230301' },
  { provinciaId: 'PRO-2304', nombre: 'TARATA', codigo: '230401' },

  // TUMBES - Capitales
  { provinciaId: 'PRO-2401', nombre: 'TUMBES', codigo: '240101' },
  { provinciaId: 'PRO-2402', nombre: 'ZORRITOS', codigo: '240201' },
  { provinciaId: 'PRO-2403', nombre: 'ZARUMILLA', codigo: '240301' },

  // UCAYALI - Capitales + distritos importantes
  { provinciaId: 'PRO-2501', nombre: 'CALLERÍA', codigo: '250101' },
  { provinciaId: 'PRO-2501', nombre: 'YARINACOCHA', codigo: '250102' },
  { provinciaId: 'PRO-2501', nombre: 'MASISEA', codigo: '250103' },
  { provinciaId: 'PRO-2501', nombre: 'CAMPOVERDE', codigo: '250104' },
  { provinciaId: 'PRO-2501', nombre: 'IPARIA', codigo: '250105' },
  { provinciaId: 'PRO-2501', nombre: 'NUEVA REQUENA', codigo: '250106' },
  { provinciaId: 'PRO-2501', nombre: 'MANANTAY', codigo: '250107' },
  { provinciaId: 'PRO-2502', nombre: 'RAYMONDI', codigo: '250201' },
  { provinciaId: 'PRO-2503', nombre: 'PADRE ABAD', codigo: '250301' },
  { provinciaId: 'PRO-2504', nombre: 'PURÚS', codigo: '250401' },
];

async function main() {
  console.log('🏘️ Cargando distritos completos del Perú...\n');

  let distritosCreados = 0;
  let distritosActualizados = 0;
  let errores = 0;

  for (const distrito of DISTRITOS) {
    try {
      // Verificar si la provincia existe
      const provincia = await prisma.provincia.findUnique({
        where: { id: distrito.provinciaId },
      });

      if (!provincia) {
        console.log(`❌ Provincia no encontrada: ${distrito.provinciaId} para distrito ${distrito.nombre}`);
        errores++;
        continue;
      }

      // Intentar crear o actualizar distrito
      const id = `DIS-${distrito.codigo}`;
      const existing = await prisma.distrito.findUnique({ where: { id } });

      if (existing) {
        // Actualizar si ya existe
        await prisma.distrito.update({
          where: { id },
          data: {
            nombre: distrito.nombre,
            provinciaId: distrito.provinciaId,
          },
        });
        distritosActualizados++;
      } else {
        // Crear nuevo
        await prisma.distrito.create({
          data: {
            id,
            nombre: distrito.nombre,
            provinciaId: distrito.provinciaId,
          },
        });
        distritosCreados++;
      }
    } catch (error) {
      console.error(`❌ Error procesando distrito ${distrito.nombre}:`, error);
      errores++;
    }
  }

  console.log('\n📊 Resumen de carga:');
  console.log(`   ✅ Distritos creados: ${distritosCreados}`);
  console.log(`   🔄 Distritos actualizados: ${distritosActualizados}`);
  console.log(`   ❌ Errores: ${errores}`);

  // Verificar totales
  const totales = await prisma.distrito.count();
  console.log(`\n📈 Total de distritos en BD: ${totales}`);

  // Mostrar distritos de Lima
  const distritosLima = await prisma.distrito.findMany({
    where: { provinciaId: 'PRO-1501' },
    orderBy: { nombre: 'asc' },
  });

  console.log(`\n📍 Distritos de Lima Metropolitana: ${distritosLima.length}`);
  console.log('   Algunos: MIRAFLORES, SAN ISIDRO, SANTIAGO DE SURCO, SAN BORJA, LA MOLINA, etc.');

  // Verificar UCAYALI
  const distritosUcayali = await prisma.distrito.findMany({
    where: {
      provincia: {
        departamento: {
          nombre: 'UCAYALI',
        },
      },
    },
    include: {
      provincia: true,
    },
  });

  console.log(`\n📍 Distritos de UCAYALI: ${distritosUcayali.length}`);
  distritosUcayali.forEach(d => {
    console.log(`   - ${d.nombre} (${d.provincia.nombre})`);
  });

  console.log('\n✅ Carga de distritos completada!');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
