import { createClerkClient } from "@clerk/nextjs/server";
import prisma from "../lib/prisma";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const posts = [
  {
    title: "Otwarcie nowego eko-sklepu na Starówce",
    content:
      "Z radością informujemy o otwarciu nowego sklepu z lokalnymi produktami ekologicznymi przy ul. Rynek 15. Znajdziecie tam świeże warzywa od lokalnych rolników, naturalne kosmetyki oraz produkty zero waste. Zapraszamy w godzinach 8:00-18:00!",
  },
  {
    title: "Wielka wymiana roślin w sobotę",
    content:
      "W najbliższą sobotę o 11:00 w Parku Miejskim organizujemy wymianę roślin doniczkowych. Przynieś sadzonki, które chcesz wymienić i zabierz do domu nowe gatunki! To świetna okazja do poznania innych miłośników roślin z naszej okolicy.",
  },
  {
    title: "Lokalna piekarnia wprowadza chleb na zakwasie",
    content:
      "Piekarnia 'U Wojtka' przy ul. Piekarskiej wprowadza do oferty tradycyjny chleb na zakwasie, wypiekany z mąki z lokalnego młyna. Bez konserwantów, bez dodatków - tylko naturalne składniki. Polecamy spróbować!",
  },
  {
    title: "Sprzątanie brzegów rzeki - dołącz do akcji",
    content:
      "W niedzielę 5 stycznia organizujemy wielkie sprzątanie brzegów rzeki Białki. Zbiórka o 9:00 przy moście głównym. Worki i rękawiczki zapewniamy. Po akcji wspólne ognisko i ciepła herbata. Zapraszamy całe rodziny!",
  },
  {
    title: "Warsztaty szycia toreb z materiałów z recyklingu",
    content:
      "Centrum Kultury zaprasza na bezpłatne warsztaty szycia ekologicznych toreb na zakupy. Nauczymy jak przerabiać stare ubrania na praktyczne torby wielokrotnego użytku. Zapisy pod numerem 123-456-789. Liczba miejsc ograniczona!",
  },
  {
    title: "Nowy punkt zbiórki elektrośmieci",
    content:
      "Od przyszłego tygodnia przy ul. Ekologicznej 10 działa nowy punkt zbiórki zużytego sprzętu elektronicznego. Można oddać stare telefony, komputery, baterie i żarówki. Punkt czynny we wtorki i czwartki 10:00-16:00.",
  },
  {
    title: "Targ produktów lokalnych co niedzielę",
    content:
      "Przypominamy, że każdą niedzielę na Placu Targowym odbywa się targ produktów lokalnych. Świeże jajka, miód z okolicznych pasiek, domowe przetwory, sery od lokalnych producentów. Wspierajmy lokalnych rolników!",
  },
  {
    title: "Rowerowa Masa Krytyczna - inauguracja sezonu",
    content:
      "Zapraszamy na pierwszy w tym roku przejazd Rowerowej Masy Krytycznej! Start 15 marca o 17:00 spod Ratusza. Trasa około 10 km przez centrum miasta. Pokażmy, że rower to świetny środek transportu miejskiego!",
  },
  {
    title: "Biblioteka rzeczy - wypożycz zamiast kupować",
    content:
      "Nasza Biblioteka Rzeczy przy ul. Wspólnej 5 poszerza ofertę! Teraz możecie wypożyczyć nie tylko narzędzia, ale też sprzęt sportowy, namioty, gry planszowe i wiele więcej. Współdzielenie to oszczędność i ekologia!",
  },
  {
    title: "Konkurs na najpiękniejszy balkon z ziołami",
    content:
      "Urząd Miasta ogłasza konkurs na najpiękniejszy balkon obsadzony ziołami i jadalnymi roślinami. Zgłoszenia do końca kwietnia, rozstrzygnięcie w maju. Główna nagroda: voucher 500 zł do lokalnej szkółki roślin. Szczegóły na stronie miasta.",
  },
  {
    title: "Darmowe warsztaty kompostowania domowego",
    content:
      "Miejski Ośrodek Ekologii zaprasza na bezpłatne warsztaty kompostowania. Dowiedz się jak przetwarzać resztki kuchenne w cenny nawóz do ogrodu. Każdy uczestnik otrzyma starter do kompostownika! Zapisy online.",
  },
  {
    title: "Lokalna kawiarnia rezygnuje z plastiku",
    content:
      "Kawiarnia 'Pod Lipą' jako pierwsza w mieście całkowicie zrezygnowała z plastikowych opakowań. Kubki na wynos są teraz z materiałów biodegradowalnych, a za własny kubek dostaniesz 10% zniżki!",
  },
  {
    title: "Szukamy wolontariuszy do ogrodu społecznego",
    content:
      "Ogród społeczny przy ul. Zielonej potrzebuje pomocnych rąk! Szukamy osób, które pomogą w przygotowaniu grządek na wiosnę. W zamian - świeże warzywa z własnych upraw. Spotkanie organizacyjne w czwartek o 18:00.",
  },
  {
    title: "Nowa ścieżka rowerowa przez las",
    content:
      "Zakończyła się budowa nowej ścieżki rowerowej łączącej osiedle Słoneczne z Lasem Miejskim. 3 km bezpiecznej trasy dla rowerzystów i biegaczy. Oświetlenie solarne działa od zmierzchu do 22:00.",
  },
  {
    title: "Akcja sadzenia drzew w parku",
    content:
      "W ramach akcji 'Zielone Miasto' w sobotę sadzimy 50 nowych drzew w Parku Północnym. Każdy może zasadzić swoje drzewko! Zapewniamy sadzonki, łopaty i instruktaż. Zbiórka o 10:00 przy wejściu głównym.",
  },
  {
    title: "Kurs naprawy sprzętu AGD",
    content:
      "Repair Cafe organizuje kurs naprawy drobnego sprzętu AGD. Nauczymy jak naprawić toster, żelazko czy suszarkę zamiast je wyrzucać. Kurs w każdą środę 17:00-19:00 w Domu Kultury. Wstęp wolny!",
  },
  {
    title: "Lokalni pszczelarze zapraszają na spotkanie",
    content:
      "Koło Pszczelarzy zaprasza na otwarte spotkanie o roli pszczół w ekosystemie. Degustacja lokalnych miodów, porady jak stworzyć ogród przyjazny pszczołom. Niedziela, godz. 15:00, świetlica przy ul. Kwiatowej.",
  },
  {
    title: "Wymiana ubrań - drugie życie dla garderoby",
    content:
      "Swap Party w Centrum Handlowym 'Stara Fabryka'! Przynieś ubrania, które już nie nosisz i wymień na nowe skarby. Zero odpadów, zero wydatków. Sobota 11:00-16:00, sala eventowa na 2 piętrze.",
  },
  {
    title: "Budżet obywatelski - głosuj na projekty eko",
    content:
      "Ruszło głosowanie na projekty budżetu obywatelskiego. Wśród propozycji: łąki kwietne, poidełka dla ptaków, stacje naprawy rowerów. Głosuj do końca miesiąca na stronie urzędu miasta!",
  },
  {
    title: "Otwarcie wypożyczalni cargo bike",
    content:
      "Od poniedziałku przy dworcu działa wypożyczalnia rowerów cargo. Idealne do większych zakupów bez samochodu! Pierwsze 2 godziny za darmo dla mieszkańców z kartą miejską. Zapraszamy!",
  },
];

async function syncUsersFromClerk() {
  console.log("🔄 Synchronizuję użytkowników z Clerk...");

  const clerkUsers = await clerk.users.getUserList({ limit: 100 });

  for (const clerkUser of clerkUsers.data) {
    await prisma.user.upsert({
      where: { id: clerkUser.id },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser.firstName ?? clerkUser.username ?? "Unknown",
        avatarUrl: clerkUser.imageUrl,
      },
      create: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser.firstName ?? clerkUser.username ?? "Unknown",
        avatarUrl: clerkUser.imageUrl,
      },
    });
  }

  console.log(`✅ Zsynchronizowano ${clerkUsers.data.length} użytkowników`);
  return clerkUsers.data;
}

async function main() {
  console.log("🌱 Rozpoczynam seedowanie...");

  const users = await syncUsersFromClerk();

  if (users.length === 0) {
    console.error("❌ Brak użytkowników w Clerk");
    process.exit(1);
  }

  const lokaltuUser = users.find((u) => u.firstName === "Zespol Lokaltu");
  if (!lokaltuUser) {
    console.error("❌ Nie znaleziono użytkownika 'Zespol Lokaltu'");
    process.exit(1);
  }

  console.log(`👤 Używam użytkownika: ${lokaltuUser.firstName}`);

  await prisma.admin.deleteMany();
  await prisma.admin.create({
    data: { userId: lokaltuUser.id },
  });
  console.log(`👑 Ustawiono admina: ${lokaltuUser.firstName}`);

  const existingPosts = await prisma.post.count();
  if (existingPosts > 0) {
    console.log(`ℹ️ Posty już istnieją (${existingPosts}), pomijam dodawanie`);
  } else {
    const now = new Date();
    await prisma.post.createMany({
      data: posts.map((post, index) => ({
        title: post.title,
        content: post.content,
        allowed: true,
        authorId: lokaltuUser.id,
        createdAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000),
      })),
    });
    console.log(`🎉 Dodano ${posts.length} postów`);
  }

  console.log("✅ Seedowanie zakończone!");
}

main()
  .catch((e) => {
    console.error("❌ Błąd podczas seedowania:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
