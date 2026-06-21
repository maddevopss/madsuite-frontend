jest.mock("jspdf", () => {
  const mockText = jest.fn();
  const mockSave = jest.fn();

  function MockJsPDF() {
    return {
      text: mockText,
      save: mockSave,
    };
  }

  MockJsPDF.mockText = mockText;
  MockJsPDF.mockSave = mockSave;

  return MockJsPDF;
});

jest.mock("jspdf-autotable", () => jest.fn());

const jsPDF = require("jspdf");
const autoTable = require("jspdf-autotable");

const { exportReportsCSV, exportReportsPDF } = require("../utils/reportsExcel.utils");

const rows = [
  {
    client: "Client Test",
    projet: "Projet Test",
    utilisateur: "User Test",
    entrees: 2,
    premiere_entree: "2026-05-20T12:00:00",
    derniere_entree: "2026-05-21T12:00:00",
    taux_horaire: 90,
    heures: 3,
    heures_facturables: 2,
    montant_estime: 180,
    montant_facture: 120,
  },
];

const total = {
  heures: 3,
  heures_facturables: 2,
  montant_estime: 180,
  montant_facture: 120,
};

beforeEach(() => {
  jest.clearAllMocks();

  localStorage.setItem(
    "user",
    JSON.stringify({
      nom: "User Test",
    }),
  );

  global.URL.createObjectURL = jest.fn(() => "blob:test-url");
  global.URL.revokeObjectURL = jest.fn();

  jest.spyOn(document, "createElement").mockImplementation(() => ({
    href: "",
    download: "",
    click: jest.fn(),
  }));
});

afterEach(() => {
  localStorage.clear();
  document.createElement.mockRestore();
});

describe("exportReportsCSV", () => {
  test("ne fait rien si aucune ligne", () => {
    exportReportsCSV([], "month");

    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  test("génère un CSV et déclenche le téléchargement", () => {
    exportReportsCSV(rows, "month");

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-url");

    const link = document.createElement.mock.results[0].value;

    expect(link.click).toHaveBeenCalled();
    expect(link.download).toMatch(/^MADSuite-(?:User-Test|user)-month-/);
    expect(link.download).toMatch(/\.csv$/);
  });

  test("échappe les guillemets dans le CSV", () => {
    exportReportsCSV(
      [
        {
          ...rows[0],
          client: 'Client "VIP"',
        },
      ],
      "month",
    );

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});

describe("exportReportsPDF", () => {
  test("ne fait rien si aucune ligne", () => {
    exportReportsPDF([], total, "month");

    expect(jsPDF.mockText).not.toHaveBeenCalled();
    expect(jsPDF.mockSave).not.toHaveBeenCalled();
  });

  test("génère un PDF avec tableau et sauvegarde", () => {
    exportReportsPDF(rows, total, "month");

    expect(jsPDF.mockText).toHaveBeenCalledWith("Rapport MADSuite", 14, 15);

    expect(jsPDF.mockText).toHaveBeenCalledWith("Période : month", 14, 23);

    expect(autoTable).toHaveBeenCalled();

    expect(jsPDF.mockSave).toHaveBeenCalled();

    const fileName = jsPDF.mockSave.mock.calls[0][0];

    expect(fileName).toMatch(/^MADSuite-(?:User-Test|user)-month-/);
    expect(fileName).toMatch(/\.pdf$/);
  });

  test("utilise user si localStorage user est invalide", () => {
    localStorage.setItem("user", "{pas-json}");

    exportReportsPDF(rows, total, "year");

    const fileName = jsPDF.mockSave.mock.calls[0][0];

    expect(fileName).toMatch(/^MADSuite-user-year-/);
    expect(fileName).toMatch(/\.pdf$/);
  });
});
