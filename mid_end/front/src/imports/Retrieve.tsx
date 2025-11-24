import svgPaths from "./svg-ky8ajppq4y";
import imgPlaceholderPicture from "figma:asset/ec8f016d30871cab49c52501657924d86f0824b1.png";

function Top() {
  return <div className="content-stretch flex gap-[5px] items-center shrink-0" data-name="Top" />;
}

function Top1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full" data-name="Top">
      <p className="font-['Roboto:Bold',sans-serif] font-bold leading-[1.1] relative shrink-0 text-[#21272a] text-[42px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        센싱 데이터 조회
      </p>
    </div>
  );
}

function Headline() {
  return (
    <div className="absolute content-stretch flex gap-[24px] h-[46px] items-start left-[24px] top-[24px] w-[1466px]" data-name="Headline">
      <div className="basis-0 content-stretch flex flex-col gap-[48px] grow items-start min-h-px min-w-px relative shrink-0" data-name="Section Text">
        <Top1 />
      </div>
    </div>
  );
}

function IconContainer() {
  return (
    <div className="bg-[#dde1e6] content-stretch flex gap-[10px] h-full items-center justify-center relative shrink-0 w-[48px]" data-name="Icon Container">
      <div aria-hidden="true" className="absolute border-[#c1c7cd] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon / jam-icons / outline & logos / arrow-right">
        <div className="absolute inset-[20.89%_20.83%_23.64%_20.83%]" data-name="Vector">
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(105, 112, 119, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <path d={svgPaths.pf6d0c00} fill="var(--fill-0, #697077)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fields() {
  return (
    <div className="absolute content-stretch flex items-center justify-end left-[25px] top-[118px]" data-name="Fields">
      <div className="bg-white box-border content-stretch flex gap-[8px] h-[48px] items-center px-[16px] py-[12px] relative shrink-0" data-name="Field">
        <div aria-hidden="true" className="absolute border-[#c1c7cd] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
        <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#697077] text-[16px] w-[114px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Start date
        </p>
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon / jam-icons / outline & logos / calendar">
          <div className="absolute inset-[12.5%_8.33%]" data-name="Vector">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(105, 112, 119, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
                <path d={svgPaths.p12f70500} fill="var(--fill-0, #697077)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center self-stretch">
        <IconContainer />
      </div>
      <div className="bg-white box-border content-stretch flex gap-[8px] h-[48px] items-center px-[16px] py-[12px] relative shrink-0" data-name="Field">
        <div aria-hidden="true" className="absolute border-[#c1c7cd] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
        <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#697077] text-[16px] w-[114px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          End date
        </p>
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon / jam-icons / outline & logos / calendar">
          <div className="absolute inset-[12.5%_8.33%]" data-name="Vector">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(105, 112, 119, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
                <path d={svgPaths.p12f70500} fill="var(--fill-0, #697077)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Top2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0 w-full" data-name="Top">
      <p className="font-['Roboto:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[1.1] relative shrink-0 text-[#21272a] text-[18px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        화재 데이터
      </p>
    </div>
  );
}

function Hints() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Hints">
      <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0" data-name="List Item With">
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon / jam-icons / filled / circle-f">
          <div className="absolute inset-[8.6%_8.33%_8.06%_8.33%]" data-name="Vector">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(105, 112, 119, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                <path d={svgPaths.p299c4700} fill="var(--fill-0, #697077)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
        <p className="font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#697077] text-[16px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          온도
        </p>
      </div>
      <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0" data-name="List Item With">
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon / jam-icons / filled / circle-f">
          <div className="absolute inset-[8.6%_8.33%_8.06%_8.33%]" data-name="Vector">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(221, 225, 230, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                <path d={svgPaths.p299c4700} fill="var(--fill-0, #DDE1E6)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
        <p className="font-['Roboto:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#697077] text-[16px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          연기
        </p>
      </div>
    </div>
  );
}

function GraphLabel() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full" data-name="graph-label">
      <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-[48px]" data-name="graph-label">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-nowrap text-right whitespace-pre">100</p>
      </div>
      <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0" data-name="line">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 553 1">
            <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="553" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-nowrap text-right whitespace-pre">10000</p>
    </div>
  );
}

function GraphLabel1() {
  return (
    <div className="content-stretch flex gap-[8px] h-0 items-center justify-end relative shrink-0 w-full" data-name="graph-label">
      <div className="h-0 relative shrink-0 w-[594px]" data-name="line">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 594 1">
            <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="594" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function GraphLabel2() {
  return (
    <div className="h-[1.029e_-14px] relative shrink-0 w-full" data-name="graph-label">
      <div className="absolute h-0 left-[59px] top-[-0.33px] w-[594px]" data-name="line">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 594 1">
            <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="594" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function GraphLabel3() {
  return (
    <div className="h-[1.029e_-14px] relative shrink-0 w-[609px]" data-name="graph-label">
      <div className="absolute bottom-[-851.56%] left-0 right-0 top-0" data-name="line">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 609 1">
            <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="609" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function GraphLabel4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full" data-name="graph-label">
      <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-[48px]" data-name="graph-label">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-nowrap text-right whitespace-pre">0</p>
      </div>
      <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0" data-name="line">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 566 1">
            <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="566" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-nowrap text-right whitespace-pre">300</p>
    </div>
  );
}

function Top3() {
  return (
    <div className="absolute content-stretch flex flex-col h-[267px] items-start justify-between left-0 top-0 w-[653px]" data-name="Top">
      <GraphLabel />
      <GraphLabel1 />
      <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full" data-name="graph-label">
        <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-[48px]" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-nowrap text-right whitespace-pre">80</p>
        </div>
        <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0" data-name="line">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 597 1">
              <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="597" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>
      </div>
      <GraphLabel2 />
      <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full" data-name="graph-label">
        <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-[48px]" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-nowrap text-right whitespace-pre">60</p>
        </div>
        <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0" data-name="line">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 597 1">
              <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="597" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex h-[calc(1px*((var(--transform-inner-width)*0.0010991365415975451)+(var(--transform-inner-height)*0.9999994039535522)))] items-center justify-center relative shrink-0 w-[calc(1px*((var(--transform-inner-height)*0.0010991365415975451)+(var(--transform-inner-width)*0.9999994039535522)))]" style={{ "--transform-inner-width": "605", "--transform-inner-height": "1" } as React.CSSProperties}>
        <div className="flex-none rotate-[0.063deg]">
          <div className="content-stretch flex gap-[8px] items-center justify-end relative w-[605px]" data-name="graph-label">
            <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0" data-name="line">
              <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 605 1">
                  <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="605" y1="0.5" y2="0.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full" data-name="graph-label">
        <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-[48px]" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-nowrap text-right whitespace-pre">40</p>
        </div>
        <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0" data-name="line">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 597 1">
              <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="597" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full" data-name="graph-label">
        <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0" data-name="line">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 653 1">
              <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="653" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full" data-name="graph-label">
        <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-[48px]" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-nowrap text-right whitespace-pre">20</p>
        </div>
        <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0" data-name="line">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 597 1">
              <line id="line" stroke="var(--stroke-0, #DDE1E6)" x2="597" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>
      </div>
      <GraphLabel3 />
      <GraphLabel4 />
      <div className="absolute bottom-[39px] left-[56px] right-0 top-[38px]" data-name="graph-part / graph-style">
        <div className="absolute bottom-0 left-[0.31%] right-0 top-0" data-name="Line">
          <div className="absolute inset-[-0.35%_-0.13%_-0.53%_-0.13%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 597 192">
              <path d={svgPaths.p1b262b00} id="Line" stroke="var(--stroke-0, #878D96)" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[9.92%] left-0 right-0 top-[10.48%]" data-name="Line">
          <div className="absolute bottom-[-0.66%] left-0 right-[-0.07%] top-[-0.66%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 598 154">
              <path d={svgPaths.pc304380} id="Line" stroke="var(--stroke-0, #C1C7CD)" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphLines() {
  return (
    <div className="h-[290px] relative shrink-0 w-full" data-name="graph / lines">
      <Top3 />
      <div className="absolute box-border content-stretch flex gap-[22px] h-[15px] items-start left-0 pl-[48px] pr-0 py-0 top-[275px] w-[653px]" data-name="graph-parts / labels / x-axis">
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Jan</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Feb</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Mar</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Apr</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">May</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Jun</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Jul</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Aug</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Sep</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Oct</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Nov</p>
        </div>
        <div className="basis-0 content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0" data-name="graph-label">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#697077] text-[12px] text-center text-nowrap whitespace-pre">Dec</p>
        </div>
      </div>
    </div>
  );
}

function DashboardSection() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[16px] h-[444px] items-center left-[24px] p-[16px] top-[214px] w-[685px]" data-name="Dashboard Section">
      <div aria-hidden="true" className="absolute border border-[#dde1e6] border-solid inset-0 pointer-events-none" />
      <Top2 />
      <Hints />
      <GraphLines />
    </div>
  );
}

function PageContent() {
  return (
    <div className="absolute bg-white h-[814px] left-[22px] rounded-[15px] top-[148px] w-[1514px]" data-name="Page Content">
      <Headline />
      <Fields />
      <DashboardSection />
      <div className="absolute h-[566px] left-[734px] top-[166px] w-[756px]" data-name="Placeholder / picture">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute bg-[#dde1e6] inset-0" />
          <img alt="" className="absolute max-w-none object-50%-50% object-cover size-full" src={imgPlaceholderPicture} />
        </div>
      </div>
    </div>
  );
}

function IconJamIconsOutlineLogosMenu() {
  return <div className="absolute bg-white left-[8px] size-[24px] top-[12px]" data-name="icon / jam-icons / outline & logos / menu" />;
}

function TextContainer() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-center justify-center left-[39px] top-[16px]" data-name="Text Container">
      <p className="font-['Roboto:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-none relative shrink-0 text-[#001d6c] text-[16px] text-nowrap tracking-[0.5px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        통합 분석
      </p>
    </div>
  );
}

function Tab() {
  return (
    <div className="absolute box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center left-0 px-0 py-[16px] top-0 w-[124px]" data-name="tab">
      <IconJamIconsOutlineLogosMenu />
      <TextContainer />
      <div className="absolute h-[20px] left-[13px] overflow-clip top-[12px] w-[19px]" data-name="icon / feathericons / monitor">
        <div className="absolute inset-[12.5%_8.33%_29.17%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-8.57%_-6.32%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 14">
              <path d={svgPaths.p3ecb8f80} id="Vector" stroke="var(--stroke-0, #21272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[87.5%_33.33%_12.5%_33.33%]" data-name="Vector">
          <div className="absolute inset-[-1px_-15.79%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 2">
              <path d="M1 1H7.33333" id="Vector" stroke="var(--stroke-0, #21272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[12.5%] left-1/2 right-1/2 top-[70.83%]" data-name="Vector">
          <div className="absolute inset-[-30%_-1px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 6">
              <path d="M1 1V4.33333" id="Vector" stroke="var(--stroke-0, #21272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextContainer1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0" data-name="Text Container">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-none relative shrink-0 text-[#21272a] text-[16px] text-nowrap tracking-[0.5px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        데이터 조회
      </p>
    </div>
  );
}

function TextContainer2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0" data-name="Text Container">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-none relative shrink-0 text-[#21272a] text-[16px] text-nowrap tracking-[0.5px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        로그
      </p>
    </div>
  );
}

function TextContainer3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0" data-name="Text Container">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-none relative shrink-0 text-[#21272a] text-[16px] text-nowrap tracking-[0.5px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        설정
      </p>
    </div>
  );
}

function Tabs() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[16px] h-[48px] items-center left-0 top-[71px] w-[1560px]" data-name="Tabs">
      <Tab />
      <div className="absolute box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center left-[124px] px-0 py-[16px] top-0" data-name="tab">
        <div aria-hidden="true" className="absolute border-[#001d6c] border-[0px_0px_2px] border-solid inset-0 pointer-events-none" />
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon / icons / outline & logos / database">
          <div className="absolute inset-[8.333%]" data-name="Vector">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(33, 39, 42, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p14325c20} fill="var(--fill-0, #21272A)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
        <TextContainer1 />
      </div>
      <div className="absolute box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center left-[289px] px-0 py-[16px] top-0" data-name="tab">
        <TextContainer2 />
      </div>
      <div className="absolute left-[261px] overflow-clip size-[22px] top-[13px]" data-name="icon / iconoir / google-docs">
        <div className="absolute inset-[12.5%]" data-name="Vector">
          <div className="absolute inset-[-4.545%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
              <path d={svgPaths.p259ff600} id="Vector" stroke="var(--stroke-0, #21272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[29.17%_29.17%_70.83%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-0.75px_-8.18%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
              <path d="M0.75 0.75H9.91667" id="Vector" stroke="var(--stroke-0, #21272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-1/2 left-[29.17%] right-[29.17%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-0.75px_-8.18%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
              <path d="M0.75 0.75H9.91667" id="Vector" stroke="var(--stroke-0, #21272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[70.83%_45.83%_29.17%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-0.75px_-13.64%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 2">
              <path d="M0.75 0.75H6.25" id="Vector" stroke="var(--stroke-0, #21272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center left-[343px] px-0 py-[16px] top-0" data-name="tab">
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon / jam-icons / outline & logos / settings-alt">
          <div className="absolute inset-[16.67%_8.33%]" data-name="Vector">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(33, 39, 42, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
                <path d={svgPaths.p10e1d380} fill="var(--fill-0, #21272A)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
        <TextContainer3 />
      </div>
    </div>
  );
}

export default function Retrieve() {
  return (
    <div className="bg-[#f2f4f8] relative size-full" data-name="retrieve">
      <div className="absolute bg-[#878d96] box-border content-stretch flex flex-col gap-[8px] h-[75px] items-start left-[-1px] px-[32px] py-[16px] top-0 w-[1561px]" data-name="Theme-Subheader">
        <Top />
      </div>
      <div className="absolute h-[59px] left-[15px] overflow-clip top-[8px] w-[56px]" data-name="logo">
        <div className="absolute inset-0" data-name="Vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
            <g id="Vector"></g>
          </svg>
        </div>
        <div className="absolute inset-[16.67%_12.5%_33.33%_12.5%]" data-name="Vector">
          <div className="absolute inset-[-3.39%_-2.38%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 32">
              <path d={svgPaths.p63a5900} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[83.33%_29.17%_16.67%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-1px_-4.29%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 2">
              <path d="M1 1H24.3333" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[66.67%_62.5%_16.67%_37.5%]" data-name="Vector">
          <div className="absolute inset-[-10.17%_-1px]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 12">
              <path d="M1 1V10.8333" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[66.67%_37.5%_16.67%_62.5%]" data-name="Vector">
          <div className="absolute inset-[-10.17%_-1px]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 12">
              <path d="M1 1V10.8333" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[29.17%_29.17%_45.83%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-6.78%_-4.29%]" style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 17">
              <path d={svgPaths.p22c1006f} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
      <PageContent />
      <Tabs />
    </div>
  );
}