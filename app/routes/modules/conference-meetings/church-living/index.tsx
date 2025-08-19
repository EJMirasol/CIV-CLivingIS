import { Form, Link, redirect, useLoaderData, useNavigate } from "react-router";
import {
  ArrowDownToLine,
  ClipboardList,
  RefreshCcw,
  Search,
} from "lucide-react";
import { DataTableColumnHeader } from "~/components/data-tables/header";
import type { ColumnDef } from "@tanstack/react-table";
import { FaEye } from "react-icons/fa";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";

import { IoMdCheckboxOutline } from "react-icons/io";
import { DataTable } from "~/components/data-tables/data-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { SelectBoxWithSearch } from "~/components/selectbox/SelectBoxWithSearch";
import type { Route } from "./+types/index";
import {
  getAllClassifications,
  getAllGenders,
  getAllGradeLevels,
  getYPCLLists,
} from "~/utils/registration.server";
import { getYear } from "date-fns";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw redirect("/sign-in");
  }
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  // Type-safe search parameters with defaults
  const args = {
    hall: searchParams.hall || "",
    ypfirstName: searchParams.ypfirstName || "",
    gender: searchParams.gender || "",
    classification: searchParams.classification || "",
    gradeLevel: searchParams.gradeLevel || "",
    page: searchParams.page || "1",
    limit: searchParams.limit || "10",
  };

  const { data, pagination } = await getYPCLLists(args);
  return {
    genderList: await getAllGenders(),
    gradeLevelList: await getAllGradeLevels(),
    classificationList: await getAllClassifications(),
    data,
    pagination,
    searchFilter: args,
  };
}

export default () => {
  const {
    data,
    pagination,
    genderList,
    gradeLevelList,
    classificationList,
    searchFilter,
  } = useLoaderData<typeof loader>();

  const columns: ColumnDef<(typeof data)[0]>[] = [
    {
      accessorKey: "ypfirstName",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="YP First Name"
          column={column}
          columnKey="ypfirstName"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.ypfirstName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Gender"
          column={column}
          columnKey="gender"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">{row.original.gender}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "gradeLevel",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="gradeLevel"
          title="Grade Level"
          column={column}
          columnKey="gradeLevel"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.gradeLevel}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "classification",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="pl-2"
          title="Classification"
          column={column}
          columnKey="classification"
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">
              {row.original.classification}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "id",
      header: ({}) => {
        return <div className=" text-Raisinblack font-medium">Actions</div>;
      },
      cell: ({ row }) => {
        return (
          <>
            <div className="flex gap-2">
              <Link to={`${row.original.id}`}>
                <Button
                  size="sm"
                  className="h-8 gap-1 bg-(--app-secondary)"
                  type="button"
                >
                  <FaEye className="h-3.5 w-3.5" />
                  View
                </Button>
              </Link>
            </div>
          </>
        );
      },
    },
  ];
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="rounded-md">
          <ClipboardList className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold">
          YP CHURCH LIVING {`${getYear(new Date())}`}
        </h1>
      </div>
      <Card className="w-full p-5">
        <Form
          className="grid grid-cols-6 grid-rows-2 gap-x-6 gap-y-4"
          id="search-admissions-form"
          method="GET"
        >
          <div className="space-y-1">
            <Label>Yp First Name</Label>
            <Input
              name="ypfirstName"
              type="text"
              defaultValue={searchFilter.ypfirstName}
            />
          </div>

          <div className="space-y-1">
            <Label className="">Gender</Label>
            <SelectBoxWithSearch
              id="gender"
              name="gender"
              options={genderList.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchFilter.gender}
            />
          </div>
          <div className="space-y-1">
            <Label className="">Grade Level</Label>
            <SelectBoxWithSearch
              id="gradeLevel"
              name="gradeLevel"
              options={gradeLevelList.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchFilter.gradeLevel}
            />
          </div>
          <div className="space-y-1">
            <Label className="">Classification</Label>
            <SelectBoxWithSearch
              id="classification"
              name="classification"
              options={classificationList.map(({ label, value }) => ({
                id: value,
                name: label,
              }))}
              defaultValue={searchFilter.classification}
            />
          </div>
          <div className="col-start-6 row-start-1 row-span-2 flex ml-20 justify-center items-center gap-2">
            <Button
              className="bg-[var(--app-secondary)]"
              variant="default"
              type="submit"
            >
              <Search />
              Search
            </Button>
            <Button
              type="button"
              variant="default"
              className="border-none bg-[var(--app-secondary)] text-white"
              onClick={() => {
                navigate("/conference-meetings/ypcl/");
              }}
            >
              <RefreshCcw className="h-5 w-auto" />
            </Button>
          </div>
        </Form>
      </Card>
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Link to="/conference-meetings/ypcl/register/">
            <Button className="bg-[var(--app-secondary)] text-white">
              <IoMdCheckboxOutline /> Register
            </Button>
          </Link>

          <Button
            // className="cursor-pointer h-8 gap-1 text-white bg-[#1B978A] hover:bg-[#1B978A] hover:text-white"
            className="bg-[var(--chart-2)] text-white"
            // onClick={handleExport}
            // disabled={isExporting}
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            {/* {isExporting ? "Exporting..." : "Export"} */}
            Export
          </Button>
        </div>
      </div>
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            pagination={pagination}
            pageSizeOption={[10, 20, 50, 100]}
          />
        </CardContent>
      </Card>
    </div>
  );
};
