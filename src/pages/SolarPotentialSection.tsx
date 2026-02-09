import React, { useEffect, useRef, useState, useCallback } from "react";
import Expandable from "../components/Expandable";
import SummaryCard from "../components/SummaryCard";
import Table from "../components/Table";
import InputNumber from "../components/InputNumber";
import InputPanelsCount from "../components/InputPanelsCount";
import InputMoney from "../components/InputMoney";
import InputPercent from "../components/InputPercent";
import InputRatio from "../components/InputRatio";
import { findSolarConfig, showMoney, showNumber } from "../utils/util";

const icon = "payments";
const title = "Solar Potential analysis";

const batteryIcons = [
  "battery_0_bar",
  "battery_1_bar",
  "battery_2_bar",
  "battery_3_bar",
  "battery_4_bar",
  "battery_5_bar",
  "battery_full",
];

const SolarPotentialSection = ({
  expandedSection,
  setExpandedSection,
  configId,
  setConfigId,
  monthlyAverageEnergyBillInput,
  setMonthlyAverageEnergyBillInput,
  energyCostPerKwhInput,
  setEnergyCostPerKwhInput,
  panelCapacityWattsInput,
  setPanelCapacityWattsInput,
  dcToAcDerateInput,
  setDcToAcDerateInput,
  solarPanelConfigs,
  defaultPanelCapacityWatts,
}: {
  expandedSection: string;
  setExpandedSection: (s: string) => void;
  configId: number;
  setConfigId: (id: number) => void;
  monthlyAverageEnergyBillInput: number;
  setMonthlyAverageEnergyBillInput: (v: number) => void;
  energyCostPerKwhInput: number;
  setEnergyCostPerKwhInput: (v: number) => void;
  panelCapacityWattsInput: number;
  setPanelCapacityWattsInput: (v: number) => void;
  dcToAcDerateInput: number;
  setDcToAcDerateInput: (v: number) => void;
  solarPanelConfigs: any[];
  defaultPanelCapacityWatts: number;
}) => {
  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Financial/solar model state
  const [solarIncentives, setSolarIncentives] = useState(7000);
  const [installationCostPerWatt, setInstallationCostPerWatt] = useState(4.0);
  const [installationLifeSpan, setInstallationLifeSpan] = useState(20);
  const [efficiencyDepreciationFactor, setEfficiencyDepreciationFactor] = useState(0.995);
  const [costIncreaseFactor, setCostIncreaseFactor] = useState(1.022);
  const [discountRate, setDiscountRate] = useState(1.04);

  // Derived values
  const panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacityWatts;
  const panelsCount = solarPanelConfigs[configId]?.panelsCount ?? 20;
  const yearlyEnergyDcKwh = solarPanelConfigs[configId]?.yearlyEnergyDcKwh ?? 12000;
  const installationSizeKw = (panelsCount * panelCapacityWattsInput) / 1000;
  const installationCostTotal = installationCostPerWatt * installationSizeKw * 1000;
  const monthlyKwhEnergyConsumption = monthlyAverageEnergyBillInput / energyCostPerKwhInput;
  const yearlyKwhEnergyConsumption = monthlyKwhEnergyConsumption * 12;
  const initialAcKwhPerYear =
    yearlyEnergyDcKwh * panelCapacityRatio * dcToAcDerateInput;
  const yearlyProductionAcKwh = Array.from({ length: installationLifeSpan }, (_, year) =>
    initialAcKwhPerYear * efficiencyDepreciationFactor ** year
  );
  const yearlyUtilityBillEstimates = yearlyProductionAcKwh.map(
    (yearlyKwhEnergyProduced, year) => {
      const billEnergyKwh = yearlyKwhEnergyConsumption - yearlyKwhEnergyProduced;
      const billEstimate =
        (billEnergyKwh * energyCostPerKwhInput * costIncreaseFactor ** year) /
        discountRate ** year;
      return Math.max(billEstimate, 0);
    }
  );
  const remainingLifetimeUtilityBill = yearlyUtilityBillEstimates.reduce((x, y) => x + y, 0);
  const totalCostWithSolar =
    installationCostTotal + remainingLifetimeUtilityBill - solarIncentives;
  const yearlyCostWithoutSolar = Array.from({ length: installationLifeSpan }, (_, year) =>
    (monthlyAverageEnergyBillInput * 12 * costIncreaseFactor ** year) /
    discountRate ** year
  );
  const totalCostWithoutSolar = yearlyCostWithoutSolar.reduce((x, y) => x + y, 0);
  const savings = totalCostWithoutSolar - totalCostWithSolar;
  const energyCovered = yearlyProductionAcKwh[0] / yearlyKwhEnergyConsumption;

  // Chart
  const costChart = useRef<HTMLDivElement>(null);
  const [breakEvenYear, setBreakEvenYear] = useState(-1);

  // Google Charts rendering
  useEffect(() => {
    if (!window.google || !window.google.charts || !costChart.current) return;
    window.google.charts.load("current", { packages: ["line"] });
    window.google.charts.setOnLoadCallback(() => {
      const year = new Date().getFullYear();
      let costWithSolar = 0;
      const cumulativeCostsWithSolar = yearlyUtilityBillEstimates.map(
        (billEstimate, i) =>
          (costWithSolar +=
            i === 0 ? billEstimate + installationCostTotal - solarIncentives : billEstimate)
      );
      let costWithoutSolar = 0;
      const cumulativeCostsWithoutSolar = yearlyCostWithoutSolar.map(
        (cost) => (costWithoutSolar += cost)
      );
      const breakEven = cumulativeCostsWithSolar.findIndex(
        (costWithSolar, i) => costWithSolar <= cumulativeCostsWithoutSolar[i]
      );
      setBreakEvenYear(breakEven);

      const data = window.google.visualization.arrayToDataTable([
        ["Year", "Solar", "No solar"],
        [year.toString(), 0, 0],
        ...cumulativeCostsWithSolar.map((_, i) => [
          (year + i + 1).toString(),
          cumulativeCostsWithSolar[i],
          cumulativeCostsWithoutSolar[i],
        ]),
      ]);
      // @ts-ignore
      const chart = new window.google.charts.Line(costChart.current);
      // @ts-ignore
      const options = window.google.charts.Line.convertOptions({
        title: `Cost analysis for ${installationLifeSpan} years`,
        width: 350,
        height: 200,
      });
      chart.draw(data, options);
    });
    // eslint-disable-next-line
  }, [
    yearlyUtilityBillEstimates,
    yearlyCostWithoutSolar,
    installationCostTotal,
    solarIncentives,
    installationLifeSpan,
  ]);

  // Update config when inputs change
  const updateConfig = useCallback(() => {
    const newMonthlyKwhEnergyConsumption = monthlyAverageEnergyBillInput / energyCostPerKwhInput;
    const newYearlyKwhEnergyConsumption = newMonthlyKwhEnergyConsumption * 12;
    const newPanelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacityWatts;
    const newConfigId = findSolarConfig(
      solarPanelConfigs,
      newYearlyKwhEnergyConsumption,
      newPanelCapacityRatio,
      dcToAcDerateInput
    );
    setConfigId(newConfigId);
  }, [
    monthlyAverageEnergyBillInput,
    energyCostPerKwhInput,
    panelCapacityWattsInput,
    defaultPanelCapacityWatts,
    solarPanelConfigs,
    dcToAcDerateInput,
    setConfigId,
  ]);

  // Advanced settings toggle
  const handleAdvancedToggle = () => setShowAdvancedSettings((v) => !v);
//change completely
  return (
    <> {/*
      <Expandable
        section={expandedSection}
        setSection={setExpandedSection}
        icon={icon}
        title={title}
        subtitle="Values are only placeholders."
        subtitle2="Update with your own values."
        secondary
      />

      <div className="flex flex-col space-y-4 pt-1">
        <div className="p-4 mb-4 surface-variant outline-text rounded-lg">
          <p className="relative inline-flex items-center space-x-2">
            <span className="material-icons md:w-6 w-8">info</span>
            <span>
              Projections use a{" "}
              <a
                className="primary-text"
                href="https://developers.google.com/maps/documentation/solar/calculate-costs-us"
                target="_blank"
                rel="noopener noreferrer"
              >
                USA financial model
                <span className="material-icons text-sm">open_in_new</span>
              </a>
            </span>
          </p>
        </div>

        <div className="flex flex-col items-center w-full">
          <button className="md-text-button" onClick={handleAdvancedToggle}>
            {showAdvancedSettings ? "Hide" : "Show"} advanced settings
            <span className="material-icons">
              {showAdvancedSettings ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>

        {showAdvancedSettings && (
          <div className="grid justify-items-end">
            <a
              className="md-filled-tonal-button flex items-center"
              href="https://developers.google.com/maps/documentation/solar/calculate-costs-us"
              target="_blank"
              rel="noopener noreferrer"
            >
              More details
              <span className="material-icons ml-2">open_in_new</span>
            </a>
          </div>
        )}

        <InputMoney
          value={monthlyAverageEnergyBillInput}
          icon="credit_card"
          label="Monthly average energy bill"
          onChange={(v) => {
            setMonthlyAverageEnergyBillInput(v);
            updateConfig();
          }}
        />

        <div className="inline-flex items-center space-x-2">
          <div className="grow">
            <InputPanelsCount
              configId={configId}
              setConfigId={setConfigId}
              solarPanelConfigs={solarPanelConfigs}
            />
          </div>
          <button className="md-icon-button" onClick={updateConfig}>
            <span className="material-icons">sync</span>
          </button>
        </div>

        <InputMoney
          value={energyCostPerKwhInput}
          icon="paid"
          label="Energy cost per kWh"
          onChange={(v) => {
            setEnergyCostPerKwhInput(v);
            updateConfig();
          }}
        />

        <InputMoney
          value={solarIncentives}
          icon="redeem"
          label="Solar incentives"
          onChange={setSolarIncentives}
        />

        <InputMoney
          value={installationCostPerWatt}
          icon="request_quote"
          label="Installation cost per Watt"
          onChange={setInstallationCostPerWatt}
        />

        <InputNumber
          value={panelCapacityWattsInput}
          icon="bolt"
          label="Panel capacity"
          suffix="Watts"
          onChange={(v) => {
            setPanelCapacityWattsInput(v);
            updateConfig();
          }}
        />

        {showAdvancedSettings && (
          <div className="flex flex-col space-y-4">
            <InputNumber
              value={installationLifeSpan}
              icon="date_range"
              label="Installation lifespan"
              suffix="years"
              onChange={setInstallationLifeSpan}
            />

            <InputPercent
              value={dcToAcDerateInput}
              icon="dynamic_form"
              label="DC to AC conversion"
              onChange={setDcToAcDerateInput}
            />

            <InputRatio
              value={efficiencyDepreciationFactor}
              icon="trending_down"
              label="Panel efficiency decline per year"
              decrease
              onChange={setEfficiencyDepreciationFactor}
            />

            <InputRatio
              value={costIncreaseFactor}
              icon="price_change"
              label="Energy cost increase per year"
              onChange={setCostIncreaseFactor}
            />

            <InputRatio
              value={discountRate}
              icon="local_offer"
              label="Discount rate per year"
              onChange={setDiscountRate}
            />
          </div>
        )}

        <SummaryCard
          icon={icon}
          title={title}
          rows={[
            {
              icon: "energy_savings_leaf",
              name: "Yearly energy",
              value: showNumber(
                (solarPanelConfigs[configId]?.yearlyEnergyDcKwh ?? 0) * panelCapacityRatio
              ),
              units: "kWh",
            },
            {
              icon: "speed",
              name: "Installation size",
              value: showNumber(installationSizeKw),
              units: "kW",
            },
            {
              icon: "request_quote",
              name: "Installation cost",
              value: showMoney(installationCostTotal),
            },
            {
              icon:
                batteryIcons[
                  Math.floor(Math.min(Math.round(energyCovered * 100) / 100, 1) * 6)
                ],
              name: "Energy covered",
              value: Math.round(energyCovered * 100).toString(),
              units: "%",
            },
          ]}
        />

        <div ref={costChart} />
        
        <div className="w-full secondary-text">
          <Table
            rows={[
              {
                icon: "wallet",
                name: "Cost without solar",
                value: showMoney(totalCostWithoutSolar),
              },
              {
                icon: "wb_sunny",
                name: "Cost with solar",
                value: showMoney(totalCostWithSolar),
              },
              {
                icon: "savings",
                name: "Savings",
                value: showMoney(savings),
              },
              {
                icon: "balance",
                name: "Break even",
                value:
                  breakEvenYear >= 0
                    ? `${breakEvenYear + new Date().getFullYear() + 1} in ${breakEvenYear + 1}`
                    : "--",
                units: "years",
              },
            ]}
          />
        </div>
      </div>

      {expandedSection === title && (
        <div className="absolute top-0 left-0">
          <div className="flex flex-col space-y-2 m-2">
          
          </div>

          <div className="mx-2 p-4 surface on-surface-text rounded-lg shadow-lg">
        
          </div>
        </div>
      ) 
  */}
    </>
  );
};

export default SolarPotentialSection;