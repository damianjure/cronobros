import { ItineraryDay, ChatMessage, PinnedPoint, PendingPlace } from './types';

// PR5: trimmed the Iceland-prototype fixtures that used to leak into real
// app views (`friends`, `upcomingHighlights`, `initialDrivers`,
// `activeVehicle`) — those are gone now, per design's Migration/Rollout
// ("Iceland data.ts discarded"). What remains below is dev/test-only seed
// data consumed exclusively by `InMemoryTripRepository`'s default
// constructor (used by unit tests, not by the real app, which runs on
// `FirestoreTripRepository`).
export const initialItinerary: ItineraryDay[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    date: '2026-08-12',
    dayOfWeek: 'Lunes',
    title: 'Llegada y Descanso',
    location: 'Grindavik, Islandia',
    activities: [
      {
        id: 'act-1-1',
        time: '10:00 AM',
        type: 'Relaxation',
        title: 'Balneario Geotermal Blue Lagoon',
        description: 'Disfruta de las aguas ricas en minerales. Incluye entrada premium, mascarilla de lodo de sílice y una bebida a elección en el bar del agua.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOVcrw9sEAtPKXOhgwlCKzgxlb-I9BYZ000TLQqhm9rwc90ef9NdkluI7yGt5ZGCjfBjosd1TzSq_9llYh9zpje1PbA_wP1MrwbHJR92-o5INyamrxzrQqexyc5F3WScRRPDHZf0cMZARqGqHQNinX-KzpO9AtR3VpMIn-wxH-hOWmi7_YLsHjTcz8eh3gAX3hEHem26o98xx4itijmSRTXROm6zihQhGPhTGt_STlrjygTmwUUgbu6tqzkSl96hW69G9oMHugObYY',
        location: 'Grindavik'
      },
      {
        id: 'act-1-2',
        time: '1:30 PM',
        type: 'Dining',
        title: 'Cafetería Bryggjan',
        description: 'Famoso por su sopa de langosta y vistas al puerto. Un lugar local perfecto para recargar energías después del spa.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaSCuaHqa8N5xvh9KhGJ7KH9kg2QjHy4ePNMmtN_5dHo9ZQk4y1GjuIm-R5jLyVIrySAPb_YtHvYUkIrXuAKazzLO9Wh4t8mJTsyReBvKf6-fOEVl_norXovhFIUjsXdrIkOyoC5cHkbKempySCSleDxd9RHf5Gw-2oMBmNB5d9ocovzxI1hyzsnSvnVehhLiBQQMrGz5TVQHfzjExoElWMoNkzbJjEUH9BMJwmB9FeV3EUg85TzH1NPILleSClf6cBr1dbU5FVbGD',
        status: 'Reserva Confirmada',
        location: 'Puerto de Grindavik'
      }
    ]
  },
  {
    id: 'day-2',
    dayNumber: 2,
    date: '2026-08-13',
    dayOfWeek: 'Martes',
    title: 'Deriva Continental',
    location: 'Península del Sur',
    activities: [
      {
        id: 'act-2-1',
        time: '9:00 AM',
        type: 'Sightseeing',
        title: 'Puente Entre Continentes',
        description: 'Un pequeño puente peatonal sobre una gran fisura que ofrece evidencia clara de la presencia de un límite de placas divergentes.',
        location: 'Sandvik'
      }
    ]
  }
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: {
      name: 'Sarah',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_scvakiKbrrrRI_-Pm2qEKrgr42w-Zxnzfo1elMxW-rblu18TPbSGvrqUpslnCSJswJyezA3RB93Bj4MhSFwkTgD6OaZF2UOycSOQEP-ZGbSZYR2dUHB83651Y26BzJMxAGj0Je8w8OxXBsB-12sjBlVwtvZT2qO-9oZEYUt8JNzg0niZMMZTdvTaDa-hT-wzSCqzNgxoCv2rh_hg1LScTbdhGOY2CT77m02PSoTFnbTkdEtPfPofPPifuj0OfUpGXwwr-s10U-54',
      role: 'Viajera'
    },
    content: "¡Acabo de subir 12 fotos nuevas de la caminata por el glaciar! Son increíbles. 🏔️",
    timestamp: '10:45 AM'
  },
  {
    id: 'msg-2',
    sender: {
      name: 'James',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHjNJ4pnfvzfQ0YItd7YHU2x_L7AASDOE3HpbZvqrrwCbWgzGvwqMxFnSzl32YcK4JvjOl3zWq0Urs9TVYlhIGvKIaMrpVaTfAqF_d-xANEw5e_UfOPB53jcOYRYznBc9tyB9w3BUWCi6DcB_I2OPw71g25WOoMroD84ISG10pdoh0ouLDp-0o_BjV5JlcKzGjxUxj8j-69cm1nFsu4_zU1rG57lUYwuZr_Zp29F6tZb_P9d8dCDGT1mb4-0MKvtfPC1ccjSyKZebv',
      role: 'Explorador'
    },
    content: "Añadí 'Bæjarins Beztu Pylsur' a la lista de almuerzos para el Día 8. Los perritos calientes son imprescindibles.",
    timestamp: '11:12 AM'
  },
  {
    id: 'msg-3',
    sender: {
      name: 'Maya',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBASr24FgG3vzWTsDBsDfYRpGRsrizvm6jVMGJpXnT_osDk3Xh2_4Pwsjb68JkpjHPd6dOtI9GYaAOI45_NtWBgPEUuVc21ouwj19OF4eehIMGE6ebp7gDNA9ZGeg8u4aiQU8_c--C9p360niDkPVg0TF_aVIH0gHiL7N4gkL1kJW_dh7ZdJn2vE8FQbY_g_bvjdTfxO-hXRARP-ZnjO-Wvc0o1WePDjEwaOboQLUaJ8O90ngK347qcjrwDkVs2ox-Z2QyjWdwH2p8c',
      role: 'Organizadora'
    },
    content: 'Actualización rápida: El ferry a la isla Hrísey sale mañana a las 2 PM en punto. ¡No lleguen tarde! 🚢',
    timestamp: '12:30 PM',
    isImportant: true
  }
];

export const pinnedPoints: PinnedPoint[] = [
  {
    id: 'pin-1',
    title: 'Balneario Blue Lagoon',
    description: 'Balneario geotérmico de color azul lechoso rodeado de campos de lava.',
    category: 'Relajación',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOVcrw9sEAtPKXOhgwlCKzgxlb-I9BYZ000TLQqhm9rwc90ef9NdkluI7yGt5ZGCjfBjosd1TzSq_9llYh9zpje1PbA_wP1MrwbHJR92-o5INyamrxzrQqexyc5F3WScRRPDHZf0cMZARqGqHQNinX-KzpO9AtR3VpMIn-wxH-hOWmi7_YLsHjTcz8eh3gAX3hEHem26o98xx4itijmSRTXROm6zihQhGPhTGt_STlrjygTmwUUgbu6tqzkSl96hW69G9oMHugObYY',
    isTopPick: true,
    coords: { x: 180, y: 310 }
  },
  {
    id: 'pin-2',
    title: 'Cascada Skógafoss',
    description: 'Impresionante cascada de 60m con arcoíris vibrantes.',
    category: 'Maravilla Natural',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe_D7ocmnJjqWe_3G2_JkzO7q-Vgwu6dUjfc28AHCWPtL75GyQcHDbvQ6E9ejU18fjh2czglP_Cj_BTkcD1ZPkCIeWNWDjp7v-vl_zvIIUS1RRvx6lje5dGALPQ-GnoRdVxCQERi5vYH9M8HFbT_1BXkoz653n72DoMg-99T8aF-DtPxoAyNSJNpKmQ04WSjuBGWG2uH-DzgMjL4-0DvForlZ2zMnSAmyTXtsGRA16QVDZTdSJamlU-MUKMu33Jc8YBXS6xU1O8NA-',
    coords: { x: 450, y: 470 }
  },
  {
    id: 'pin-3',
    title: 'Playa de Arena Negra',
    description: 'Playa Reynisfjara con columnas de basalto y farallones marinos.',
    category: 'Punto Icónico',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwEBdceeUB0xhMWEzJCEvG0eCX51v-vXxJQ-CfFsXZW82ErjmLQokqv3J6WOjbrJ1B5ZSO0WoU_r8f26qPwfT-Ln_bHNe64hZZvvRdop3LBTolktL_1_kbUROb55rRtRjKBkmbJR6nD11erGTu7v1bWpuIx_6W3cRtpMp0mgfx_T4DII9DjoJFk35jV8h3mmt2f7zrcu4Jf1-BBPk-SV5T6S0uGvUcETg91OlIsCGatUuuiQi9s7bzk9O0xndwTV2W1H0SkgVtSU-L',
    coords: { x: 710, y: 510 }
  },
  {
    id: 'pin-4',
    title: 'Laguna Glaciar',
    description: 'Laguna profunda Jökulsárlón con majestuosos icebergs flotantes.',
    category: 'Kayak Disponible',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCvvsyBqnATybhE2W1X0nWWtsMb8ygt1WCI1c0m5dUiWAN81iJ3txqFnPdtuEYJWiBUAP9aAQps9ukg3V1fPSZlCVo-sMokt1pvEK3duYN9CbsaRdA0wdumVJfKx6XfQjhw-1P2QdWLeO107cDyzxM88YEWgaRJzUsapYCRlnmrky43bpG3VTKVQL-znOczr_Dv5o608I0RjQH0EjTGeW31mDoKj5NvYUc2qCEjeeK2F6QlU4pMWxsSxCETeRrN3HpKzc3rdDHAb0l',
    coords: { x: 890, y: 420 }
  }
];

export const initialPendingPlaces: PendingPlace[] = [
  {
    id: 'pending-1',
    title: 'Restaurante Dill',
    category: 'Gastronomía',
    description: 'Alta cocina nórdica galardonada. Menú degustación con ingredientes hiperlocales de Islandia.',
    location: 'Reikiavik',
    people: ['Alex Thorne', 'Sarah Miller', 'James', 'Maya', 'Sofía', 'Mateo']
  },
  {
    id: 'pending-2',
    title: 'Caminata Volcánica Fagradalsfjall',
    category: 'Aventura',
    description: 'Caminata para explorar los campos de lava recientes en la península de Reykjanes.',
    location: 'Grindavík',
    people: ['Alex Thorne', 'James', 'Mateo']
  },
  {
    id: 'pending-3',
    title: 'Río Termal Reykjadalur',
    category: 'Relajación',
    description: 'Báñate en un río de agua caliente natural que fluye por un hermoso valle verde.',
    location: 'Hveragerði',
    people: ['Sarah Miller', 'Maya', 'Sofía', 'Mateo']
  }
];
