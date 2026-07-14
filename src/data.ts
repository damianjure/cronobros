import { ItineraryDay, ChatMessage, UpcomingHighlight, Driver, Vehicle, PinnedPoint, PendingPlace, Friend } from './types';

// Single source of truth for the trip's friend group (id/name/avatar tuples).
// Previously duplicated inline in App.tsx and ItineraryView.tsx.
export const friends: Friend[] = [
  { id: 'alex', name: 'Alex Thorne', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4B5JPVpAuZzSoy3FOKnNgVzKzEXrZIk7UFw2O17ZbZ4SrNyqWuSDoPC39FZecjNMatQ4G4uhMHBavH8Or4Y_bMvbp6C8ow_I3MyoUbypn6bmancOLfJnbDOAHJBRbDJN-w94UqC0D8FSvrT6hP2Xg8LVOgF74_R9zOcZqkmSnGyt4OYBBt3Tj0YXhKICvDl8ZqncCGvfUBScEKQL2TcsOn1KYLe65ApjYQjol-ng4dRjrQDQ45DQgNIrY2ASp__0tOo1WXy1wI1kq' },
  { id: 'sarah', name: 'Sarah Miller', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfFQUgXGvEuDKvhZO0ButMHU_vysIYP7RkgQDECitwhIjeKNPxmnN1rqaSfnQ8TecNnu6Q9aCBg4daAI559ycoyReMPHCmO5QxkBvyNOB8Tizo1RC2OpDCVLouElZEdvhqHP4cpj-n5jw7GXqY8yeothMjnMQeHZeev1Gywxjn8n_yVtFXiHYQiVICXdf3bRCg8wlTqSw_oEMK0aMTiIu8PQTIO_HsKpkDm3w-Bj2Qdst45JVV7sKssASFgH-SYx1kU0BTFo5qVPLZ' },
  { id: 'james', name: 'James', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHjNJ4pnfvzfQ0YItd7YHU2x_L7AASDOE3HpbZvqrrwCbWgzGvwqMxFnSzl32YcK4JvjOl3zWq0Urs9TVYlhIGvKIaMrpVaTfAqF_d-xANEw5e_UfOPB53jcOYRYznBc9tyB9w3BUWCi6DcB_I2OPw71g25WOoMroD84ISG10pdoh0ouLDp-0o_BjV5JlcKzGjxUxj8j-69cm1nFsu4_zU1rG57lUYwuZr_Zp29F6tZb_P9d8dCDGT1mb4-0MKvtfPC1ccjSyKZebv' },
  { id: 'maya', name: 'Maya', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBASr24FgG3vzWTsDBsDfYRpGRsrizvm6jVMGJpXnT_osDk3Xh2_4Pwsjb68JkpjHPd6dOtI9GYaAOI45_NtWBgPEUuVc21ouwj19OF4eehIMGE6ebp7gDNA9ZGeg8u4aiQU8_c--C9p360niDkPVg0TF_aVIH0gHiL7N4gkL1kJW_dh7ZdJn2vE8FQbY_g_bvjdTfxO-hXRARP-ZnjO-Wvc0o1WePDjEwaOboQLUaJ8O90ngK347qcjrwDkVs2ox-Z2QyjWdwH2p8c' },
  { id: 'sofia', name: 'Sofía', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_scvakiKbrrrRI_-Pm2qEKrgr42w-Zxnzfo1elMxW-rblu18TPbSGvrqUpslnCSJswJyezA3RB93Bj4MhSFwkTgD6OaZF2UOycSOQEP-ZGbSZYR2dUHB83651Y26BzJMxAGj0Je8w8OxXBsB-12sjBlVwtvZT2qO-9oZEYUt8JNzg0niZMMZTdvTaDa-hT-wzSCqzNgxoCv2rh_hg1LScTbdhGOY2CT77m02PSoTFnbTkdEtPfPofPPifuj0OfUpGXwwr-s10U-54' },
  { id: 'mateo', name: 'Mateo', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' }
];

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

export const upcomingHighlights: UpcomingHighlight[] = [
  {
    id: 'hl-1',
    day: 1,
    type: 'Dining',
    title: 'Llegada y Reikiavik',
    description: 'Registro en el Hotel Borg, seguido de una cena de bienvenida en el Restaurante Dill.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuTi2At1XjRvJPyD5AU62ilT8TICZ6zXT8FZ2k37akxH-_NNEcLHnO2_6Vaj24sSrzKOE2AR0QeHS5rfqbSJ2ylRqLDgEJRMURB0a0fUJjs0KGE8daqwRP53xmvPJtDPv6mYxy04KF5UFeyBdF4R5ZYw3k4EzWq2tnfv5WNTRtVOZyFUsm6hFx4bo7WI8luCLEK9zgwQyB1NIUxWZPTN3mP4BuMwldCtXIz3snd11P324vOnRjPZhhBoo13v2PmjNKiSfJ69kxhpU_',
    status: 'CONFIRMED'
  },
  {
    id: 'hl-2',
    day: 4,
    type: 'Sightseeing',
    title: 'El Círculo Dorado',
    description: 'Explorando el Parque Nacional Þingvellir, Geysir y la majestuosa cascada de Gullfoss.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kbbAVSGnOTZjuDOJbgKxvomdkFv5dlPjxQlL8K4RSkPMJynCQ4XkYX-8nN_ieyYhjFAimCZlGiwUXYJfrIfR8xfU4_5aR9W6jAP36Qtk_Tvi0IZaTtS6mGiabINpPHyHmdVY6G6smwzHqNZGww_PiqileoStp0VHXbxZzzHkQbhDpOLVxIelUlB_IhB4m6m-nTXBkqaE79Wyy9pcbbcQrfpTJ_iOzrVMtd_4wN1Wrnk1_kd2hXCvD1to7uznxceO9gusiK382DnK',
    status: 'PENDING'
  },
  {
    id: 'hl-3',
    day: 6,
    type: 'Dining',
    title: 'Cena en la Costa Norte',
    description: 'Banquete tradicional de mariscos islandeses en un bistró de puerto aislado en Akureyri.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeqYOVHQaLLYFTeFU6qBp1uzDjIM-vwlY2d6x_lGNTmU5F1H8vJi9cZTqHnnkU9k5gZPjITKPiB9P8_os6Y9XxKQmI_VUKjoOJizX3j6zp3IkKHh_3S7bI3YPRWESbaw3hej8ge6WvomIWnQTXJ2Y1uODPoywd4fIJDuFnuLWt4jN20lMwh8lRlx7ueptyt3cmXrdZWbYNx6DHZlZNESX8c8ttyQ8NBJyxAiOQ_5vc_xUudlLXFTe69yZwwzJ-5jyX1tNocHGjFUe4',
    status: 'RESERVED'
  }
];

export const initialDrivers: Driver[] = [
  {
    id: 'drv-1',
    name: 'Alex Thorne',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4B5JPVpAuZzSoy3FOKnNgVzKzEXrZIk7UFw2O17ZbZ4SrNyqWuSDoPC39FZecjNMatQ4G4uhMHBavH8Or4Y_bMvbp6C8ow_I3MyoUbypn6bmancOLfJnbDOAHJBRbDJN-w94UqC0D8FSvrT6hP2Xg8LVOgF74_R9zOcZqkmSnGyt4OYBBt3Tj0YXhKICvDl8ZqncCGvfUBScEKQL2TcsOn1KYLe65ApjYQjol-ng4dRjrQDQ45DQgNIrY2ASp__0tOo1WXy1wI1kq',
    status: 'On Shift',
    role: 'Líder de Expedición Principal',
    shift: '08:00 — 14:00 (Diario)'
  },
  {
    id: 'drv-2',
    name: 'Sarah Miller',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfFQUgXGvEuDKvhZO0ButMHU_vysIYP7RkgQDECitwhIjeKNPxmnN1rqaSfnQ8TecNnu6Q9aCBg4daAI559ycoyReMPHCmO5QxkBvyNOB8Tizo1RC2OpDCVLouElZEdvhqHP4cpj-n5jw7GXqY8yeothMjnMQeHZeev1Gywxjn8n_yVtFXiHYQiVICXdf3bRCg8wlTqSw_oEMK0aMTiIu8PQTIO_HsKpkDm3w-Bj2Qdst45JVV7sKssASFgH-SYx1kU0BTFo5qVPLZ',
    status: 'Standby',
    role: 'Soporte Secundario',
    shift: '14:00 — 20:00 (Diario)'
  }
];

export const activeVehicle: Vehicle = {
  name: 'Land Rover Defender',
  rentalId: 'HRZ-4022-ISL',
  provider: 'Alquileres Nómada Nórdico',
  phone: '+354 555 0129',
  dates: '12 Ago - 24 Ago (12 Días)',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRzd7QFTvi4k51FQ4ToLI_E4Bfm10ug1V2bXEMm4sRicl4HujxhEdvhZHEOZdw0rP3jBSJw5ugSL-FTxhpUKPLNr_fZL1wREtrLxqbfOo7SU3_4dFAkWh3c95yhh7DRmX3EY77q_mIEj405S-iLYRD5rcT9JQnOIBy6HQsKYfpD0iVfbuzkTMoZsFaRrMNFeRhd5-0uZlewspO12Bp8z3NPDrjmic2WFJDo5iGG7tPWM4R4Qlo87wB92-MY-baHkLR_2uQSg88DsoK'
};

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
