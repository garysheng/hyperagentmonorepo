import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function DMsLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-8 w-[200px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-5 h-[calc(100vh-12rem)]">
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-[80px]" />
                    <Skeleton className="h-3 w-[60px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="col-span-2 h-[calc(100vh-12rem)] p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[60px]" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-[60px]" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 