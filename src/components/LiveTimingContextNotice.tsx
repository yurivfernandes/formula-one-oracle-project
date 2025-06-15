
interface LiveTimingContextNoticeProps {
  raceStatus: "before" | "live" | "after";
  gpName: string;
  localStartTime: string;
}

export default function LiveTimingContextNotice({ raceStatus, gpName, localStartTime }: LiveTimingContextNoticeProps) {
  if (raceStatus === "before") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-800 text-sm">
        <b>Importante:</b> A corrida do {gpName} começa às <b>{localStartTime}</b> (horário local da página).
        <br />
        O Live Timing exibirá a ordem do grid de largada (qualifying) até a largada.
        <br />
        O acompanhamento em tempo real será ativado a partir do início da corrida.
      </div>
    );
  }
  if (raceStatus === "live") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800 text-sm">
        Dados sendo atualizados automaticamente · Última atualização: {new Date().toLocaleTimeString("pt-BR")}
      </div>
    );
  }
  return null;
}
