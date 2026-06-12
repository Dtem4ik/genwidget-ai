import type { SearchApartmentsInput, SearchApartmentsOutput } from "./schema";

export function ApartmentResults({
  output,
}: {
  input: SearchApartmentsInput;
  output: SearchApartmentsOutput;
}) {
  if (output.apartments.length === 0) {
    return <p className="text-muted-foreground text-sm">No apartments match these filters.</p>;
  }
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {output.apartments.map((apt) => (
        <li key={apt.id}>
          {apt.rooms}-room · {apt.area} m² · ${apt.price.toLocaleString("en-US")} — {apt.complex}
        </li>
      ))}
    </ul>
  );
}
