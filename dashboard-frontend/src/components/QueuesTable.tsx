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

interface QueuesTableProps {
  queues: Queue[];
}

const QueuesTable: React.FC<QueuesTableProps> = ({
  queues,
}: QueuesTableProps) => {
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
              <TableCell>Scaled</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queues.length > 0 ? (
              queues.map((queue) => (
                <QueueTableRow key={queue.url} queue={queue} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  There are no queues at the moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default QueuesTable;
