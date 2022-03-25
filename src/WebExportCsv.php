<?php
declare(strict_types=1);

namespace Pt\WebExportCsv;

use Encore\Admin\Extension;

class WebExportCsv extends Extension
{
    public $name = 'table-export-csv';

    public $views = __DIR__ . '/../resources/views';

    public $assets = __DIR__ . '/../resources/assets';
}
