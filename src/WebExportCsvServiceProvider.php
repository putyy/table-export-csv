<?php
declare(strict_types=1);

namespace Pt\WebExportCsv;

use Illuminate\Support\ServiceProvider;

class WebExportCsvServiceProvider extends ServiceProvider
{
    /**
     * {@inheritdoc}
     */
    public function boot(WebExportCsv $extension)
    {
        if (!WebExportCsv::boot()) {
            return;
        }

        if ($views = $extension->views()) {
            $this->loadViewsFrom($views, 'table-export-csv');
        }

        if ($this->app->runningInConsole() && $assets = $extension->assets()) {
            $this->publishes(
                [$assets => public_path('vendor/putyy/table-export-csv')],
                'table-export-csv'
            );
        }
    }
}
