import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Queue from "../models/Queue";
import QueueTableRow from "./QueueTableRow";
import { useState, useCallback } from "react";

interface QueuesTableProps {
  queues: Queue[];
}

const QueuesTable: React.FC<QueuesTableProps> = ({
  queues,
}: QueuesTableProps) => {
  const [selected, setSelected] = useState<string | null>();

  const handleSelect = useCallback(
    (queueUrl: string) => {
      queueUrl === selected ? setSelected(null) : setSelected(queueUrl);
    },
    [selected]
  );

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>More</TableCell>
              <TableCell>Queue name</TableCell>
              <TableCell>Messages</TableCell>
              <TableCell>Messages delayed</TableCell>
              <TableCell>Messages not visible</TableCell>
              <TableCell>Add messages</TableCell>
              <TableCell>More</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queues.map((queue) => (
              <QueueTableRow
                key={queue.url}
                queue={queue}
                selected={queue.url === selected}
                handleSelect={handleSelect}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default QueuesTable;
