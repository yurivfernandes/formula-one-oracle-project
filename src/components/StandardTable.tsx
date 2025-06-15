
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StandardTableProps {
  title: string;
  subtitle?: string;
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const StandardTable: React.FC<StandardTableProps> = ({
  title,
  subtitle,
  headers,
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-black rounded-xl border border-red-800/70 overflow-hidden shadow-2xl ${className}`}
    >
      <div className="p-6 border-b border-red-800/50 bg-black">
        <h2 className="text-2xl font-bold text-red-500 mb-2">{title}</h2>
        {subtitle && <p className="text-gray-300">{subtitle}</p>}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-800/60 bg-black">
              {headers.map((header, index) => (
                <TableHead
                  key={index}
                  className="text-red-400 font-bold uppercase tracking-wider"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-black">{children}</TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StandardTable;
